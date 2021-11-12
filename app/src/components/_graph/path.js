/*
 * 添加静态多边形元素 不可操作编辑
 *
 **/
import BaseGraph from './base';
import * as d3 from 'd3';
import { color_config } from '../../config/color.config';
import { get_id, get_class } from '../../config/id.config';

import { bboxToPoints } from '../v2/project.utils';

class PathGraph extends BaseGraph {
  constructor(config) {
    let that = config.vue;
    config.ratio = that.ratio;
    config.class = '';
    super(null, config);
    this.father_id = config.father_id;
    this.data = config.data;
    this.id = config.id;
    this.mode = config.mode;
    this.saveWalls = config.saveWalls;
    this.vue = that;
  }

  draw() {
    let d = '';
    let keyArr = Object.keys(this.saveWalls);
    keyArr.forEach((key) => {
      let sw_points = bboxToPoints(
        this.saveWalls[key],
        this.vue.ratio,
        this.vue.config.graph_height
      );
      sw_points.forEach((point, index) => {
        if (index === 0) {
          d += `M${point[0]} ${point[1]} `;
        } else {
          d += `L${point[0]} ${point[1]} `;
        }
        if (index === sw_points.length - 1) {
          d += 'z ';
        }
      });
    });
    // let points = bboxToPoints(
    //   this.data,
    //   this.vue.ratio,
    //   this.vue.config.graph_height
    // );
    // console.log('points: ', points);

    let mode = this.mode;
    console.log('=====polygon: ===', this.father_id);
    // let node = d3
    //   .select(`#${this.father_id}`)
    //   .append('polygon') //添加一个矩形
    //   .attr('class', `${get_class(mode)['cad_draw_polygon']}`)
    //   .attr('id', this.id)
    //   .attr('points', points)
    //   // .attr('bbox', this.data)
    //   .attr('count', this.data.length)
    //   .attr('type', mode)
    //   .attr('stroke', color_config()[mode])
    //   .attr('stroke-width', '2px')
    //   .attr('fill-opacity', 0);

    let node = d3
      .select(`#${this.father_id}`)
      .append('path') //添加一个矩形
      .attr('class', `${get_class(mode)['cad_draw_polygon']}`)
      .attr('id', this.id)
      .attr('d', d)
      // .attr('bbox', this.data)
      .attr('count', this.data.length)
      .attr('type', mode)
      .attr('stroke', color_config()[mode])
      .attr('stroke-width', '2px')
      .attr('fill-opacity', 0);

    node.lower(); // 不能挡住其它障碍物类型
  }
}

export { PathGraph };
