import * as d3 from 'd3';

import { AssistNodeGraph } from './assist';
import { get_id } from '../../config/id.config';

// 画辅助点
function addAssistPoints(node_id, that, mode = 'mark') {
  console.log('that: ', that);
  let node = d3
    .select(`#${node_id}`)
    .node()
    .getBBox();

  let assist_points_list = [];

  // 左上角
  assist_points_list.push({
    location: 'LT',
    origin_id: node_id,
    type: 'scale',
    x: node.x,
    y: node.y,
  });

  // 上边中点
  assist_points_list.push({
    location: 'T',
    origin_id: node_id,
    type: 'translate',
    x: node.x + 0.5 * node.width,
    y: node.y,
  });

  // 右上角
  assist_points_list.push({
    location: 'RT',
    origin_id: node_id,
    type: 'scale',
    x: node.x + node.width,
    y: node.y,
  });

  // 右边中点
  assist_points_list.push({
    location: 'R',
    origin_id: node_id,
    type: 'translate',
    x: node.x + node.width,
    y: node.y + 0.5 * node.height,
  });

  // 右下角
  assist_points_list.push({
    location: 'RB',
    origin_id: node_id,
    type: 'scale',
    x: node.x + node.width,
    y: node.y + node.height,
  });

  // 下边中点
  assist_points_list.push({
    location: 'B',
    origin_id: node_id,
    type: 'translate',
    x: node.x + 0.5 * node.width,
    y: node.y + node.height,
  });

  // 左下角
  assist_points_list.push({
    location: 'LB',
    origin_id: node_id,
    type: 'scale',
    x: node.x,
    y: node.y + node.height,
  });

  // 左边中点
  assist_points_list.push({
    location: 'L',
    origin_id: node_id,
    type: 'translate',
    x: node.x,
    y: node.y + 0.5 * node.height,
  });

  console.log('assist_points_list: ', assist_points_list);

  assist_points_list.forEach((item) => {
    let assist_node = new AssistNodeGraph({
      vue: that,
      x: item.x,
      y: item.y,
      location: item.location,
      origin_id: node_id,
      type: item.type,
      mode,
    });
    assist_node.draw();
  });
}

// 画水平垂直辅助线
function addAssistLines(path_g, node, color) {
  let g = path_g.append('g').attr('id', get_id()['assist_line_g']);
  const TIMES = 2;

  g.append('line')
    .attr('x1', node.x - TIMES * node.width)
    .attr('x2', node.x + (TIMES + 1) * node.width)
    .attr('y1', node.y)
    .attr('y2', node.y)
    .attr('stroke', color)
    .attr('stroke-width', '1px')
    .attr('stroke-dasharray', 2);

  g.append('line')
    .attr('x1', node.x - TIMES * node.width)
    .attr('x2', node.x + (TIMES + 1) * node.width)
    .attr('y1', node.y + node.height)
    .attr('y2', node.y + node.height)
    .attr('stroke', color)
    .attr('stroke-width', '1px')
    .attr('stroke-dasharray', 2);

  g.append('line')
    .attr('x1', node.x)
    .attr('x2', node.x)
    .attr('y1', node.y - TIMES * node.height)
    .attr('y2', node.y + (TIMES + 1) * node.height)
    .attr('stroke', color)
    .attr('stroke-width', '1px')
    .attr('stroke-dasharray', 2);

  g.append('line')
    .attr('x1', node.x + node.width)
    .attr('x2', node.x + node.width)
    .attr('y1', node.y - TIMES * node.height)
    .attr('y2', node.y + (TIMES + 1) * node.height)
    .attr('stroke', color)
    .attr('stroke-width', '1px')
    .attr('stroke-dasharray', 2);
}

export { addAssistPoints, addAssistLines };
