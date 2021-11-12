/*
 * 添加新元素 region paht obstacle
 *
 **/
import BaseGraph from './base';
import * as d3 from 'd3';
import { color_config } from '../../config/color.config';
import {
  create_random,
  judge_rect_intersect,
  format_bbox,
  format_points,
  re_format_points,
  pointsToBbox,
  toDecimal,
  get_node_points,
  re_format_polygon_bbox,
  bboxToPoints,
} from '../v2/project.utils';
import { yTrans } from '../sc-graph/utils';
import { get_id, get_class } from '../../config/id.config';
import {
  svgContextmenuEvent,
  svgClickEvent,
  formatZoomPoint,
} from './graph.event';
import { addAssistPoints } from './item.event';
import Adsorb from './adsorb';
import store from '../../models/store/index';

class AssistNodeGraph extends BaseGraph {
  constructor(config) {
    // config
    // vue: that,
    // x: d3.event.x,
    // y: d3.event.y
    let that = config.vue;
    config.ratio = that.ratio;
    config.title = 'assist-node';
    config.id = that.new_node.id ? that.new_node.id : '';
    config.class = '';
    super(null, config);
    this.id = get_id(config.location)['assist_node'];
    this.x = toDecimal(config.x);
    this.y = toDecimal(config.y);
    this.location = config.location;
    this.type = config.type;
    this.mode = config.mode; // mark  model
    this.origin_id = config.origin_id;
    this.vue = that;
    this.radius = 4;
    this.start_x = 0;
    this.start_y = 0;
    this.start_points = null;
    this.inputFlag = this.location.length === 1;
  }

  draw() {
    // let path_g = this.vue.svg.path_g;
    let path_g = this.vue.svg.g;
    let data_id = create_random();

    let new_id = get_id(this.location)['assist_node'];
    // path_g.raise();
    let g;
    if (d3.select(`#${get_id()['assist_g']}`).size() > 0) {
      g = d3.select(`#${get_id()['assist_g']}`);
    } else {
      g = path_g.append('g').attr('id', get_id()['assist_g']);
    }

    let points = `${this.x - this.radius},${this.y - this.radius} ${this.x +
      this.radius},${this.y - this.radius} ${this.x + this.radius},${this.y +
      this.radius} ${this.x - this.radius},${this.y + this.radius}`;

    let node = g
      .append('polygon') //添加一个矩形
      .attr(
        'class',
        `${get_class(this.location)['assist_node_id']} ${
          get_class()['assist_node']
        }`
      )
      .attr('id', new_id)
      .attr('origin_id', this.origin_id)
      .attr('points', points)
      .attr('location', this.location)
      .attr('type', this.type)
      .attr('stroke', color_config()['assist'])
      .attr('stroke-width', '1px')
      .attr('fill-opacity', 0);

    let that = this.vue;

    // 绑定左键事件
    this.bindEvent(node, svgClickEvent, this.vue, function() {
      console.log('assist node: ', node);
    });

    let t = this;
    // let start_x = 0;
    // let start_y = 0;
    this.adsorb = new Adsorb({
      vue: that,
      type: 'deform',
      mode: this.mode,
    });
    // 绑定拖拽事件
    node.call(
      d3
        .drag()
        .on('start', function() {
          let uncustomizable = d3
            .select(`#${t.origin_id}`)
            .classed(get_class(false)['customizable']);
          // 阻止拖拽
          if (uncustomizable) {
            return false;
          }
          if (t.mode === 'model') {
            t.start_points = re_format_points(get_node_points(t.origin_id));
            d3.select(`#${t.origin_id}`).attr('points', t.start_points);
          } else {
            t.start_points = d3.select(`#${t.origin_id}`).attr('points');
          }
          d3.selectAll(`.${get_class()['assist_node']}`)
            .filter(function() {
              console.log(d3.select(this).attr('id'));
              return d3.select(this).attr('id') !== node.attr('id');
            })
            .remove();
          t.adsorb.drag_start(t.origin_id, d3.event);

          this.start_x = d3.event.x;
          this.start_y = d3.event.y;
          d3.select(`#${get_id()['assist_box']}`).remove();
          // 画虚线
          d3.select(`#${get_id()['assist_g']}`)
            .append('polygon')
            .attr('points', d3.select(`#${t.origin_id}`).attr('points'))
            .attr('fill-opacity', '0')
            .attr('stroke', d3.select(`#${t.origin_id}`).attr('stroke'))
            .attr('stroke-dasharray', 2);

          // 画input
          console.log('t.inputFlag: ', t.inputFlag);
          if (t.inputFlag) {
            d3.select(`#${get_id()['path_g']}`)
              .append('foreignObject')
              .attr('id', get_id()['assist_box'])
              .attr('x', d3.event.x + 5)
              .attr('y', d3.event.y + 5)
              .attr('width', 70)
              .attr('height', 30)
              .append('xhtml:form')
              // .attr('style', 'border:1px solid #000;opacity:0.5')
              .append('input')
              .attr('type', 'number')
              .attr('value', '')
              .attr('id', get_id()['assist_input'])
              .on('blur', function() {
                console.log('blur ', d3.event.target.value);
                if (d3.event.target.value !== 0) {
                  setTimeout(() => {
                    d3.select(`#${get_id()['assist_box']}`).remove();
                  }, 400);
                }
              })
              .on('input', function() {
                console.log('input ', d3.event);
              })
              .on('keypress', function() {
                var e = d3.event;
                console.log('e.keyCode: ', e.keyCode);
                if (e.keyCode === 13) {
                  d3.event.preventDefault();
                  // 输入实际的 单位mm
                  console.log(d3.event.target.value);
                  // let value = Number(d3.event.target.value) / that.ratio;
                  let value = Number(d3.event.target.value);
                  let bbox = format_bbox(
                    d3.select(`#${t.origin_id}`).attr('bbox')
                  ); // [[x0, y0], [x1, y1]]
                  console.log('bbox: ', bbox.flat(1));

                  switch (t.location) {
                    case 'L':
                      bbox[0][0] -= value;
                      break;
                    case 'R':
                      bbox[1][0] += value;
                      break;
                    case 'T':
                      bbox[1][1] += value;
                      break;
                    case 'B':
                      bbox[0][1] -= value;
                      break;
                  }
                  // t.updateAssistPolygon(point); //这里不用调用吸附组件

                  let _points = bboxToPoints(
                    bbox,
                    that.ratio,
                    store.state.config.graph_height
                  );

                  let size_x = that.getLength(bbox);
                  let size_y = that.getWidth(bbox);

                  d3.select(`#${t.origin_id}`)
                    .attr('size', `${size_x} * ${size_y}`)
                    .attr('points', re_format_points(_points))
                    .attr('bbox', re_format_polygon_bbox(bbox)); //更新newnode

                  d3.select(`#${get_id()['temp_text']}`).text(
                    `${size_x} * ${size_y}`
                  );

                  d3.select(`#${get_id()['assist_g']}`).remove();
                  // 将节点更新保存
                  if (t.mode === 'mark') {
                    t.vue.updateNewNode(t.origin_id);
                  } else if (t.mode === 'model') {
                    store.dispatch('update_model', t.origin_id);
                  }
                  addAssistPoints(t.origin_id, t.vue, t.mode);
                  setTimeout(() => {
                    d3.select(`#${get_id()['assist_box']}`).remove();
                  }, 400);
                }
              });

            setTimeout(() => {
              d3.select(`#${get_id()['assist_input']}`)
                .node()
                .focus();
            }, 400);
          }
        })
        .on('drag', function() {
          let uncustomizable = d3
            .select(`#${t.origin_id}`)
            .classed(get_class(false)['customizable']);
          // 阻止拖拽
          if (uncustomizable) {
            return false;
          }

          let point = d3.event;
          let location = t.location;
          let result;
          t.updateAssistPolygon(point);

          // if (t.inputFlag) {
          //   d3.select(`#${get_id()['assist_input']}`).attr('value', () => {
          //     switch (location) {
          //       case 'L':
          //         result = -toDecimal(d3.event.x - this.start_x, 0);
          //         break;
          //       case 'R':
          //         result = toDecimal(d3.event.x - this.start_x, 0);
          //         break;
          //       case 'T':
          //         result = -toDecimal(d3.event.y - this.start_y, 0);
          //         break;
          //       case 'B':
          //         result = toDecimal(d3.event.y - this.start_y, 0);
          //         break;
          //     }
          //     return result * that.ratio;
          //   });
          // }
        })
        .on('end', function() {
          let uncustomizable = d3
            .select(`#${t.origin_id}`)
            .classed(get_class(false)['customizable']);
          // 阻止拖拽
          if (uncustomizable) {
            return false;
          }

          d3.select(`#${get_id()['assist_g']}`).remove();
          if (t.inputFlag) {
            let value = d3.select(`#${get_id()['assist_input']}`).attr('value');
            if (value && value !== 0) {
              setTimeout(() => {
                d3.select(`#${get_id()['assist_box']}`).remove();
              }, 400);
            }
          }
          // 将节点更新保存
          if (t.mode === 'mark') {
            t.vue.updateNewNode(t.origin_id);
          } else if (t.mode === 'model') {
            store.dispatch('update_model', t.origin_id);
          }

          console.log('save end');
          addAssistPoints(t.origin_id, t.vue, t.mode);
        })
    );

    // // 绑定右键事件
    // this.bindEvent(node, svgContextmenuEvent, this.vue, function() {
    //   that.$confirm({
    //     title: `Are you sure delete this ${mode}?`,
    //     okText: 'Yes',
    //     okType: 'danger',
    //     cancelText: 'No',
    //     onOk() {
    //       console.log('OK');
    //       d3.select(`#${new_id}`).remove();
    //       console.log('new_id: ', new_id);
    //     },
    //     onCancel() {
    //       console.log('Cancel');
    //     },
    //   });
    // });
  }

  drag() {
    let points = `${this.x - this.radius},${this.y - this.radius} ${this.x +
      this.radius},${this.y - this.radius} ${this.x + this.radius},${this.y +
      this.radius} ${this.x - this.radius},${this.y + this.radius}`;

    d3.select(`#${this.id}`).attr('points', points);
  }

  // end(type = 'new') {
  //   if (type === 'add') {
  //     console.log(type);
  //   } else {
  //     // 判断 当前操作是否在选中区间内
  //     console.log(this);
  //     let new_node = d3.select(`#${this.id}`).node();
  //     let active_rect_node = d3.select(`#${get_id()['active_bbox']}`).node();
  //     let result = judge_rect_intersect(
  //       new_node.getBBox(),
  //       active_rect_node.getBBox()
  //     );
  //     console.log('new_node: ', new_node);
  //     console.log('active_rect_node: ', active_rect_node);
  //     console.log('result: ', result);
  //     if (result) {
  //       // vue add (obstacle, path, region)
  //       this.vue.new_node.data.bbox = format_bbox(
  //         d3.select(`#${this.id}`).attr('bbox')
  //       );
  //       this.vue.new_node.points = format_points(
  //         d3.select(`#${this.id}`).attr('points')
  //       );
  //       this.vue.addNewNode();
  //     } else {
  //       // clean this node
  //       this.vue.$message.warning(
  //         'The operation should be in the current room'
  //       );
  //       d3.select(`#${this.id}`).remove();
  //       d3.select(`#${get_id()['temp_text']}`).remove();
  //     }
  //   }

  //   // clean new node
  //   this.vue.new_node = {
  //     id: null,
  //     type: null,
  //     points: null,
  //     node: null,
  //     data: null,
  //   };
  //   this.vue.svg.mode = 'normal';
  // }

  updateAssistPolygon(
    point,
    location = this.location,
    type = this.type,
    mode = this.mode,
    origin_id = this.origin_id,
    vue = this.vue
  ) {
    let err = false;
    let points = format_points(d3.select(`#${origin_id}`).attr('points')); // [[x0, y0], [x1, y1]]
    switch (location) {
      case 'LT':
        if (point.x >= points[1][0] || point.y >= points[1][1]) {
          err = true;
        } else {
          points[0][0] = point.x;
          points[0][1] = point.y;
        }
        break;
      case 'T':
        if (point.y >= points[1][1]) {
          err = true;
        } else {
          points[0][1] = point.y;
        }
        break;
      case 'RT':
        if (point.x <= points[0][0] || point.y >= points[1][1]) {
          err = true;
        } else {
          points[1][0] = point.x;
          points[0][1] = point.y;
        }
        break;
      case 'R':
        if (point.x <= points[0][0]) {
          err = true;
        } else {
          points[1][0] = point.x;
        }
        break;
      case 'RB':
        if (point.x <= points[0][0] || point.y <= points[0][1]) {
          err = true;
        } else {
          points[1][0] = point.x;
          points[1][1] = point.y;
        }
        break;
      case 'B':
        if (point.y <= points[0][1]) {
          err = true;
        } else {
          points[1][1] = point.y;
        }
        break;
      case 'LB':
        if (point.x >= points[1][0] || point.y <= points[0][1]) {
          err = true;
        } else {
          points[0][0] = point.x;
          points[1][1] = point.y;
        }
        break;
      case 'L':
        if (point.x >= points[1][0]) {
          err = true;
        } else {
          points[0][0] = point.x;
        }
        break;
    }
    let result = re_format_points(points);
    if (!err) {
      if (location.includes('L') || location.includes('R')) {
        this.x = point.x;
      }
      if (location.includes('T') || location.includes('B')) {
        this.y = point.y;
      }

      let adsorb = this.adsorb.drag(point, points, 0, 0);
      this.drag(); // 拖拽单个辅助点

      if (this.inputFlag && adsorb) {
        console.log(this.start_points);
        let start_points = format_points(this.start_points);
        d3.select(`#${get_id()['assist_input']}`).attr('value', () => {
          switch (location) {
            case 'L':
              result = toDecimal(start_points[0][0] - adsorb[0][0], 0);
              break;
            case 'R':
              result = toDecimal(adsorb[1][0] - start_points[1][0], 0);
              break;
            case 'T':
              result = toDecimal(start_points[0][1] - adsorb[0][1], 0);
              break;
            case 'B':
              result = toDecimal(adsorb[1][1] - start_points[1][1], 0);
              break;
          }
          return result * this.vue.ratio;
        });
      }
      // d3.select(`#${origin_id}`)
      //   .attr('points', result)
      //   .attr('bbox', pointsToBbox(points, vue)); //更新newnode
    }
  }
}

export { AssistNodeGraph };
