import BaseGraph from './base';
import * as d3 from 'd3';
import { get_id, get_class } from '../../config/id.config';
import { get_icon } from '../../config/icon.config';
import { svgClickEvent } from './graph.event';

const X_SPACE = 10;
const Y_SPACE = 10;
const HEIGHT = 24;
const WIDTH = 24;

class ToolsGraph extends BaseGraph {
  constructor(config) {
    let that = config.vue;
    super(null, config);
    this.vue = that;
    this.x = config.x;
    this.y = config.y;
    this.iconList = config.iconList;
    this.funcList = config.funcList;
    this.destroy(); // 创建之前先销毁
    this.g = d3
      .select(`#${get_id()['g']}`)
      .append('g')
      .attr('id', get_id()['tools_g']);
  }

  draw() {
    // tools位置
    // tools的功能列表 icon func
    let _this = this;

    this.iconList.forEach((icon, index) => {
      console.log('icon: ', icon);
      let g = this.g.append('g').attr('id', get_id(icon)['tools_item']);
      let icon_node = g.html(
        get_icon({
          width: WIDTH,
          height: HEIGHT,
          x: this.x + X_SPACE,
          y: this.y + index * (Y_SPACE + HEIGHT),
        })[icon]
      );
      this.bindEvent(icon_node, svgClickEvent, this.vue, function() {
        _this.destroy();
        _this.funcList[index]();
      });
    });
  }

  redraw(x, y) {
    this.x = x;
    this.y = y;
    this.g = d3
      .select(`#${get_id()['g']}`)
      .append('g')
      .attr('id', get_id()['tools_g']);
    this.draw();
  }

  destroy() {
    d3.select(`#${get_id()['tools_g']}`).remove();
  }
}

export { ToolsGraph };
