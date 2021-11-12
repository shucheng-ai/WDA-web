import * as d3 from 'd3';
import {yTrans} from './utils';


function addGroup(config) {
  let [svg_father, svg_id, svg_width, svg_height, svg_x, svg_y, svg_class] = [
    config.svg_father,
    config.svg_id,
    config.svg_width,
    config.svg_height,
    config.svg_x,
    config.svg_y,
    config.svg_class ? config.svg_class : 'sc-g',
  ];
  let y = yTrans(svg_y, this.project.svg.height, svg_height);
  let element_id = `${svg_id}-g`;
  d3.selectAll(`#${svg_id}-g`).remove();
  const data = svg_father.append('g')
    .attr('id', element_id)
    .attr('class', svg_class)
    .attr('x', svg_x.toFixed(2))
    .attr('y', y.toFixed(2))
    .attr('width', svg_width.toFixed(2))
    .attr('height', svg_height.toFixed(2));
  return data
}

export {addGroup}