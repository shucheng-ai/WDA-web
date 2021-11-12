import * as d3 from 'd3';

import {
  toDecimal,
  format_points,
  binarySearch,
  re_format_points,
  pointsToBbox,
  getActualSize,
  get_node_points,
} from '../v2/project.utils';
import { get_id } from '../../config/id.config';

import store from '../../models/store/index';

const GRAPH_OPERATIONS_LIST = store.getters.graph_operations_list;

class Adsorb {
  // constructor
  constructor({
    vue = null,
    SPACE = 5,
    TYPE_ARR = ['wall'],
    type = 'translate',
    mode = 'mark',
    isExcluded = true, // 是否排除自己
  } = {}) {
    this.isExcluded = isExcluded;
    this.SPACE = SPACE;
    this.TYPE_ARR = TYPE_ARR; // 一直判断吸附的元素
    this.type = type; // translate 平移 deform 变形
    this.mode = mode; // mark 标注 model 模型
    this.adsorb_x = false;
    this.adsorb_y = false;
    this.x_list = new Set();
    this.y_list = new Set();
    this.xy_list = []; // 中间存储变量
    this.start_x = 0;
    this.start_y = 0;
    this.width = 0;
    this.height = 0;
    this.vue = vue;
  }

  drag_start(id, point) {
    this.start_x = point.x;
    this.start_y = point.y;
    this.adsorb_x = false;
    this.adsorb_y = false;
    // 收集x集合 和y集合
    this.x_list = new Set();
    this.y_list = new Set();
    this.xy_list = [];
    this.id = id;
    let that = this.vue;

    let points = format_points(d3.select(`#${id}`).attr('points'));
    console.log('points: ', points.flat(1));
    console.log('mode', this.mode);

    that.top_views.forEach((tvs) => {
      tvs.draw_points.forEach((dp) => {
        if (this.TYPE_ARR.includes(tvs.color)) {
          this.x_list.add(toDecimal(dp[0]));
          this.y_list.add(toDecimal(dp[1]));
        } else {
          let x = dp[0];
          let y = dp[1];
          this.xy_list.push({ x, y });
        }
      });
    });
    // that.graph_operations.flat(1).forEach((type) => {
    GRAPH_OPERATIONS_LIST.forEach((graph) => {
      let type = graph.id;
      // console.log('type: ', type);
      if (!Array.isArray(that[`${type}s`])) {
        return;
      }
      that[`${type}s`].forEach((item) => {
        // 排除自己
        if (item.element_id !== id) {
          // console.log('item: ', item);
          // 参照物图形横跨了目标
          if (
            (item.points[0][0] <= points[0][0] &&
              item.points[1][0] >= points[1][0]) ||
            (item.points[0][1] <= points[0][1] &&
              item.points[1][1] >= points[1][1])
          ) {
            // console.log('跨 ', item.element_id);
            this.x_list.add(toDecimal(item.points[0][0]));
            this.x_list.add(toDecimal(item.points[1][0]));
            this.y_list.add(toDecimal(item.points[0][1]));
            this.y_list.add(toDecimal(item.points[1][1]));
          } else {
            //xy_list的情况 需要把点都推进去
            this.xy_list.push({
              x: item.points[0][0],
              y: item.points[0][1],
            });
            this.xy_list.push({
              x: item.points[0][0],
              y: item.points[1][1],
            });
            this.xy_list.push({
              x: item.points[1][0],
              y: item.points[0][1],
            });
            this.xy_list.push({
              x: item.points[1][0],
              y: item.points[1][1],
            });
          }
        }
        if (item.draw_points) {
          console.log('item: ', item);
          item.draw_points.forEach((dp) => {
            dp.forEach((p) => {
              let x = p[0];
              let y = p[1];
              this.xy_list.push({ x, y });
            });
          });
        }
      });
    });

    // 添加modeles元素
    store.state.animation.fixtures.forEach((fixture) => {
      if (this.id !== fixture.id) {
        let fixture_points = get_node_points(fixture.id);
        this.x_list.add(toDecimal(fixture_points[0][0]));
        this.y_list.add(toDecimal(fixture_points[0][1]));
        this.x_list.add(toDecimal(fixture_points[1][0]));
        this.y_list.add(toDecimal(fixture_points[1][1]));
      }
    });

    // 添加lines元素
    that.lines.forEach((line) => {
      this.x_list.add(toDecimal(line.x1));
      this.x_list.add(toDecimal(line.x2));
      this.y_list.add(toDecimal(line.y1));
      this.y_list.add(toDecimal(line.y2));
    });

    // 过滤 xy_list 里的元素
    this.xy_list.forEach((item) => {
      if (
        item.y >= points[0][1] - 2 * this.SPACE &&
        item.y <= points[1][1] + 2 * this.SPACE
      ) {
        this.x_list.add(toDecimal(item.x));
      }
      if (
        item.x >= points[0][0] - 2 * this.SPACE &&
        item.x <= points[1][0] + 2 * this.SPACE
      ) {
        this.y_list.add(toDecimal(item.y));
      }
    });

    this.x_list = Array.from(this.x_list).sort(this.sortNumber);
    this.y_list = Array.from(this.y_list).sort(this.sortNumber);
    console.log('this.xy_list: ', this.xy_list);
    console.log('this.x_list: ', this.x_list);
    this.width = d3
      .select(`#${id}`)
      .node()
      .getBBox().width;
    this.height = d3
      .select(`#${id}`)
      .node()
      .getBBox().height;
  }

  drag(point, points, remove_x, remove_y) {
    if (this.type === 'translate') {
      remove_x = toDecimal(point.x - this.start_x);
      remove_y = toDecimal(point.y - this.start_y);

      points[0][0] = toDecimal(points[0][0] + remove_x);
      points[0][1] = toDecimal(points[0][1] + remove_y);
      points[1][0] = toDecimal(points[1][0] + remove_x);
      points[1][1] = toDecimal(points[1][1] + remove_y);
    }

    if (Math.abs(remove_x) >= this.SPACE) {
      this.adsorb_x = false;
    } else {
      let x_0 = binarySearch(this.x_list, points[0][0], this.SPACE);
      // console.log('x_0: ', x_0);
      if (x_0 !== null) {
        points[0][0] = toDecimal(x_0);
        if (this.type === 'translate') {
          points[1][0] = toDecimal(points[0][0] + this.width);
        }
        this.adsorb_x = true;
      }
      let x_1 = binarySearch(this.x_list, points[1][0], this.SPACE);
      // console.log('x_1: ', x_1);
      if (
        (this.type === 'deform' && x_1 !== null) ||
        (x_0 === null && x_1 !== null)
      ) {
        points[1][0] = toDecimal(x_1);
        if (this.type === 'translate') {
          points[0][0] = toDecimal(points[1][0] - this.width);
        }
        this.adsorb_x = true;
      }
      // console.log('this.width: ', this.width);
    }
    if (Math.abs(remove_y) >= this.SPACE) {
      this.adsorb_y = false;
    } else {
      let y_0 = binarySearch(this.y_list, points[0][1], this.SPACE);
      if (y_0 !== null) {
        points[0][1] = y_0;
        if (this.type === 'translate') {
          points[1][1] = toDecimal(points[0][1] + this.height);
        }
        this.adsorb_y = true;
      }
      let y_1 = binarySearch(this.y_list, points[1][1], this.SPACE);
      if (
        (this.type === 'deform' && y_1 !== null) ||
        (y_0 === null && y_1 !== null)
      ) {
        points[1][1] = y_1;
        if (this.type === 'translate') {
          points[0][1] = toDecimal(points[1][1] - this.height);
        }
        this.adsorb_y = true;
      }
    }

    // console.log('ddd points: ', points.flat(1));

    let resultNode = d3
      .select(`#${this.id}`)
      .attr('points', re_format_points(points))
      .attr('bbox', pointsToBbox(points, this.vue))
      .attr('size', getActualSize(points, this.vue));

    d3.select(`#${get_id()['temp_text']}`)
      .text(getActualSize(points, this.vue))
      .attr('x', resultNode.node().getBBox().x)
      .attr('y', resultNode.node().getBBox().y - 15);

    if (this.mode === 'model') {
      d3.select(`#${this.id}`).attr('points', re_format_points(points));

      d3.select(`#${this.id}>svg`)
        .attr('x', points[0][0])
        .attr('y', points[0][1]);

      if (this.type === 'deform') {
        d3.select(`#${this.id}>svg`)
          .attr('width', toDecimal(Math.abs(points[1][0] - points[0][0])))
          .attr('height', toDecimal(Math.abs(points[1][1] - points[0][1])));
      }
    }

    if (!this.adsorb_x) {
      this.start_x = point.x;
    }
    if (!this.adsorb_y) {
      this.start_y = point.y;
    }
    if (!this.adsorb_x || !this.adsorb_y) {
      return false;
    } else {
      return points;
    }
  }

  sortNumber(a, b) {
    return a - b;
  }
}

export default Adsorb;
