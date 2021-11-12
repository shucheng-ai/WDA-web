import './svg.less';
import * as d3 from 'd3';

function addSVG(config) {
  let [father_id, svg_id, svg_width, svg_height, svg_class] = [
    config.father,
    config.svg_id,
    config.svg_width,
    config.svg_height,
    config.svg_class,
  ];
  // let svg_id = 'BASE-SVG';
  let father = d3.select(`#${father_id}`);
  console.log('father: ', father);
  d3.selectAll(`#${svg_id}`).remove();
  const svg = father
    .append('svg')
    .attr('class', svg_class)
    .attr('id', `${svg_id}`)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', svg_width.toFixed(2))
    .attr('height', svg_height.toFixed(2));
  // svg.attr('width', 2000);
  // svg.attr('height', 2000);
  return svg;
}

export { addSVG };
