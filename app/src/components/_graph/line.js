/*
 * 添加静态多边形元素 不可操作编辑
 *
 **/
import BaseGraph from './base';
import * as d3 from 'd3';
import { color_config } from '../../config/color.config';
import { get_id, get_class } from '../../config/id.config';

import {
  getTwoPointDistance,
  toDecimal,
  d3XToCadX,
  d3YToCadY,
} from '../v2/project.utils';
import { yTrans } from '../sc-graph/utils';

import store from '../../models/store/index';

class LineGraph extends BaseGraph {
  constructor(config) {
    let that = config.vue;
    config.ratio = that.ratio;
    config.class = '';
    super(null, config);
    this.father_id = config.father_id;
    this.vue = that;
    this.id = null;
    this.text = null;
  }

  init(x, y) {
    store.commit('ADD_LINE_COUNT');
    let count_id = store.state.cad.line_count;
    let id = get_id(count_id)['line'];
    this.id = id;
    let node = d3
      .select(`#${this.father_id}`)
      .append('line') //添加一个矩形
      .attr('class', `${get_class()['line']}`)
      .attr('id', id)
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('stroke', color_config()['line'])
      .attr('stroke-width', '2px')
      .attr('fill-opacity', 0);

    this.x1 = x;
    this.y1 = y;

    this.text = d3
      .select(`#${this.father_id}`)
      .append('text')
      .attr('id', get_id(this.id)['line_text'])
      .attr('stroke', color_config()['line'])
      .attr('fill', color_config()['line'])
      .attr('text-anchor', 'middle')
      .style('font-size', '12px');

    return id;
  }

  end(x, y) {
    let node = d3.select(`#${this.id}`);

    let x1 = node.attr('x1');
    let y1 = node.attr('y1');
    let distance = getTwoPointDistance(x1, y1, x, y, 'int');
    distance = toDecimal(distance * this.vue.ratio, 0);
    node
      .attr('x2', x)
      .attr('y2', y)
      .attr('distance', distance);

    this.x2 = x;
    this.y2 = y;
    this.distance = distance;

    this.text
      .text(distance)
      .attr('x', (x1 * 1 + x * 1) / 2)
      .attr('y', (y1 * 1 + y * 1) / 2);
  }

  redraw(data) {
    let { id, distance, trueData } = data;
    let x1 = toDecimal(trueData.x1 / this.ratio);
    let x2 = toDecimal(trueData.x2 / this.ratio);
    let y1 = toDecimal(
      yTrans(trueData.y1 / this.ratio, this.vue.graph.config.height)
    );
    let y2 = toDecimal(
      yTrans(trueData.y2 / this.ratio, this.vue.graph.config.height)
    );

    let node = d3
      .select(`#${this.father_id}`)
      .append('line') //添加一个矩形
      .attr('class', `${get_class()['line']}`)
      .attr('id', id)
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', color_config()['line'])
      .attr('stroke-width', '2px')
      .attr('fill-opacity', 0);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.id = id;
    this.distance = distance;
    this.trueData = trueData;

    // 更新数据
    data.x1 = x1;
    data.y1 = y1;
    data.x2 = x2;
    data.y2 = y2;

    this.text = d3
      .select(`#${this.father_id}`)
      .append('text')
      .attr('id', get_id(this.id)['line_text'])
      .text(distance)
      .attr('x', (x1 * 1 + x2 * 1) / 2)
      .attr('y', (y1 * 1 + y2 * 1) / 2)
      .attr('stroke', color_config()['line'])
      .attr('fill', color_config()['line'])
      .attr('text-anchor', 'middle')
      .style('font-size', '12px');

    return node;
  }

  getData() {
    let trueData = {
      x1: d3XToCadX(this.x1, this.vue),
      x2: d3XToCadX(this.x2, this.vue),
      y1: d3YToCadY(this.y1, this.vue),
      y2: d3YToCadY(this.y2, this.vue),
    };
    this.trueData = trueData;

    return {
      id: this.id,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      distance: this.distance,
      trueData: this.trueData,
    };
  }
}

export { LineGraph };
