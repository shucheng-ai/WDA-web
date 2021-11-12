import * as d3 from 'd3';
import { yTrans } from './utils';

function addRect(config, height) {
  let [
    svg_father,
    svg_id,
    svg_class,
    svg_width,
    svg_height,
    svg_x,
    svg_y,
    bbox,
  ] = [
    config.svg_father,
    config.svg_id,
    config.svg_class,
    config.svg_width,
    config.svg_height,
    config.svg_x,
    config.svg_y,
    config.bbox,
  ];
  height = height ? height : this.project.svg.height;
  let y = yTrans(svg_y, height, svg_height);
  // d3.selectAll(`#${svg_id}-rect`).remove();
  d3.selectAll(`#${svg_id}`).remove();

  let points = toPolygon(svg_x, y, svg_width, svg_height);

  // const data = svg_father.append('rect').attr('class', svg_class).attr('id', `${svg_id}-rect`)
  //   .attr('x', svg_x.toFixed(2))
  //   .attr('y', y.toFixed(2))
  //   .attr('width', svg_width.toFixed(2))
  //   .attr('height', svg_height.toFixed(2));
  if (bbox && bbox.length > 0) {
    bbox = bbox.join(' ');
  }
  let data = svg_father
    .append('polygon')
    .attr('points', points)
    .attr('bbox', bbox)
    .attr('class', svg_class)
    .attr('id', `${svg_id}`)
    .attr('tabindex', -1); // 让svg元素 可以监听键盘事件

  // .attr('id', `${svg_id}-rect`);

  return data;
}

function getRectInfo(data) {
  const rect = {};
  let [xmin, ymin, xmax, ymax] = data;
  rect.width = xmax - xmin;
  rect.height = ymax - ymin;
  return rect;
}

function toPolygon(x, y, w, h) {
  let points = '';
  let point1 = [x, y];
  let point2 = [x + w, y];
  let point3 = [x + w, y + h];
  let point4 = [x, y + h];
  [point1, point2, point3, point4].forEach((i) => {
    let [x, y] = [i[0], i[1]];
    x = x.toFixed(2);
    y = y.toFixed(2);
    points += `${x},${y} `;
  });
  return points;
}

export { addRect, getRectInfo };
