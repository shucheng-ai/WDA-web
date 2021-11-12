// 在path or polygon 上标记
import * as d3 from 'd3';
import { color_config } from '../../config/color.config';

class Marker {
  constructor(config) {
    this.father = config.father;
    this.data = config.data;
  }

  getArrowInfo(direction, type) {
    let refX, refY, viewBox, markerWidth, markerHeight, orient, path_d, fill;
    switch (direction) {
      case 'right':
        // 水平的
        // refX = 0;
        // refY = 5;
        // viewBox = '0 0 10 10';
        // markerWidth = 10;
        // markerHeight = 10;
        // orient = 0;
        // path_d = 'M 0 0 L 5 5 L 0 10 z'; //▶path

        refX = 512;
        refY = 512;
        viewBox = '0 0 1024 1024';
        markerWidth = 10;
        markerHeight = 10;
        orient = 0;
        path_d =
          'M14.279 494.726L312.91 788.512V615.687H711.09v172.825l298.632-293.786L711.09 235.488v172.825H312.91V235.488L14.28 494.726z'; // 双向箭头path
        fill = color_config()[type];
        break;
      case 'left':
        // 水平的
        refX = 0;
        refY = 5;
        viewBox = '0 0 10 10';
        markerWidth = 10;
        markerHeight = 10;
        orient = 180;
        path_d = 'M 0 0 L 5 5 L 0 10 z';
        fill = color_config()[type];
        break;
      case 'down':
        // 纵向的
        // refX = 0;
        // refY = 5;
        // viewBox = '0 0 10 10';
        // markerWidth = 10;
        // markerHeight = 10;
        // orient = 90;
        // path_d = 'M 0 0 L 5 5 L 0 10 z';

        refX = 512;
        refY = 512;
        viewBox = '0 0 1024 1024';
        markerWidth = 10;
        markerHeight = 10;
        orient = 90;
        path_d =
          'M14.279 494.726L312.91 788.512V615.687H711.09v172.825l298.632-293.786L711.09 235.488v172.825H312.91V235.488L14.28 494.726z';
        fill = color_config()[type];
        break;
      case 'up':
        // 纵向的
        refX = 0;
        refY = 5;
        viewBox = '0 0 10 10';
        markerWidth = 10;
        markerHeight = 10;
        orient = -90;
        path_d = 'M 0 0 L 5 5 L 0 10 z';
        fill = color_config()[type];
        break;
      default:
        break;
    }
    return {
      refX,
      refY,
      viewBox,
      markerWidth,
      markerHeight,
      orient,
      path_d,
      fill,
    };
  }

  drawArrow() {
    let svg = this.father;
    let defs = svg.append('defs');
    this.data.forEach((item) => {
      let {
        refX,
        refY,
        viewBox,
        markerWidth,
        markerHeight,
        orient,
        path_d,
        fill,
      } = this.getArrowInfo(item.direction, item.type);
      defs
        .append('marker')
        .attr('id', item.id)
        .attr('type', item.type)
        .attr('class', item.class)
        .attr('viewBox', viewBox)
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('markerUnits', 'strokeWidth')
        .attr('orient', orient)
        .append('path')
        .attr('d', path_d)
        .attr('fill', fill);
    });
  }
}

export { Marker };
