import * as d3 from 'd3';
import { color_config } from '../../config/color.config';

function addLine(config) {
  let [
    svg_father,
    svg_id,
    svg_class,
    color,
    points,
    stroke_width,
    fill_color,
  ] = [
    config.svg_father,
    config.svg_id,
    config.svg_class,
    config.color,
    config.points,
    config.stroke_width,
    config.fill_color,
  ];
  // d3.selectAll(`#${svg_id}-line`).remove();
  d3.selectAll(`#${svg_id}`).remove();

  var linePath = d3.line();

  let data = svg_father
    .append('path')
    .attr('d', linePath(points))
    .attr('class', svg_class + ` ${color}`)
    .attr('points', points.join(' '))
    // .attr('id', `${svg_id}-line`)
    .attr('id', `${svg_id}`)
    .attr('stroke', color_config()[color] ? color_config()[color] : '#fff')
    .attr('stroke-width', `${stroke_width}px`)
    .attr('fill', fill_color ? fill_color : 'black')
    .attr('fill-opacity', '0');

  return data;
}

export { addLine };
