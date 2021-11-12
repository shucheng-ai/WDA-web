import * as d3 from 'd3';
import { get_id, get_class } from '../../config/id.config';
import { yTrans } from '../sc-graph/utils';

import store from '../../models/store/index';

// 1, 计算总bbox
// bbox: [[xmin, ymin], [xmax, ymax]];
function calculate_bbox_from_navigation(navigation) {
  let bbox0 = navigation[0].bbox;
  console.log('bbox0: ', bbox0);
  let xmin, ymin, xmax, ymax;
  xmin = bbox0[0][0];
  ymin = bbox0[0][1];
  xmax = bbox0[1][0];
  ymax = bbox0[1][1];
  navigation.forEach((_data) => {
    let _bbox = _data.bbox;
    xmin = xmin < _bbox[0][0] ? xmin : _bbox[0][0];
    ymin = ymin < _bbox[0][1] ? ymin : _bbox[0][1];
    xmax = xmax > _bbox[1][0] ? xmax : _bbox[1][0];
    ymax = ymax > _bbox[1][1] ? ymax : _bbox[1][1];
  });
  const padding = 50000; // 扩大背景范围
  return [xmin - padding, ymin - padding, xmax + padding, ymax + padding];
}

// 2, 计算缩放比例
// 通过 bbox 物理距离和绘图config 长宽计算缩放比例，x/y取大
// 默认 svg padding 20px
function calculate_ratio_from_bbox(bbox, config, padding_x, padding_y) {
  const default_padding = 40;
  let xmin, ymin, xmax, ymax;
  let graph_width, graph_height;
  padding_x = padding_x ? padding_x : default_padding;
  padding_y = padding_y ? padding_y : 120;
  [xmin, ymin, xmax, ymax] = bbox;
  [graph_width, graph_height] = [config.graph_width, config.graph_height];
  graph_width = graph_width - padding_x;
  graph_height = graph_height - padding_y;
  let ratio, ratio_x, ratio_y;
  ratio_x = parseInt((xmax - xmin) / graph_width);
  ratio_y = parseInt((ymax - ymin) / graph_height);
  ratio = ratio_x > ratio_y ? ratio_x : ratio_y;
  return [ratio, ratio_x, ratio_y];
}

// 计算缩放比例 弃用
function calculate_scale_from_bbox(base_bbox, bbox) {
  let [base_width, base_height, width, height] = [
    base_bbox[2] - base_bbox[0],
    base_bbox[3] - base_bbox[1],
    bbox[2] - bbox[0],
    bbox[3] - bbox[1],
  ];
  let [scale_x, scale_y] = [base_width / width, base_height / height];
  let scale = scale_x < scale_y ? scale_x : scale_y;
  return [scale, scale_x, scale_y];
}

// 计算平移到中心的距离
function calculate_translate_xy(bbox, config, ratio) {
  let width = bbox[2] - bbox[0];
  let height = bbox[3] - bbox[1];
  width = (config.graph_width - width / ratio) / 2;
  height = (config.graph_height - height / ratio) / 2;
  // TODO 这里取反后，可以显示真实cad了
  return [-bbox[0] / ratio + width, bbox[1] / ratio - height];
}

// 创建随机标志符
function create_random(len = 8) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result.toLowerCase();
}

// 判断两块区域是否相交
function judge_rect_intersect(a, b) {
  var a_min_x = a.x;
  var a_min_y = a.y;
  var a_max_x = a.x + a.width;
  var a_max_y = a.y + a.height;

  var b_min_x = b.x;
  var b_min_y = b.y;
  var b_max_x = b.x + b.width;
  var b_max_y = b.y + b.height;

  return (
    a_min_x <= b_max_x &&
    a_max_x >= b_min_x &&
    a_min_y <= b_max_y &&
    a_max_y >= b_min_y
  );
}

// 判断方向
// [[10000, 3000], [21000, 5000]]  ==> horizontal 水平
// [[1000, 30000], [2000, 5000]]  ==> vertical 纵向
function judge_bbox_direction(bbox) {
  console.log('judge_bbox_direction: ', bbox);
  let result = 'vertical';
  let _x = Math.abs(bbox[1][0] - bbox[0][0]);
  let _y = Math.abs(bbox[1][1] - bbox[0][1]);
  if (_x >= _y) {
    result = 'horizontal';
  }
  return result;
}

function format_direction(direction, type = 'direction') {
  let result = ''; // UP RIGHT DOWN LEFT
  let rs = []; // [1, 0]  [0, 1]
  if (direction === 'horizontal') {
    result = 'RIGHT';
    rs = [1, 0];
  } else if (direction === 'vertical') {
    result = 'DOWN';
    rs = [0, 1];
  }
  if (type === 'direction') {
    return result;
  } else {
    return rs;
  }
}

// [1, 0] => horizontal
// [0, 1] => vertical
function reformat_direction(_direction) {
  let result = '';
  if (_direction.length === 2 && _direction[1] === 0) {
    result = 'horizontal';
  } else if (_direction.length === 2 && _direction[0] === 0) {
    result = 'vertical';
  }
  return result;
}

// bbox: [[10797, 35685], [21045, 55998]]
// result: [10797, 21045, 35685, 55998]
function re_format_bbox(bbox) {
  let result = [];
  result.push(Math.min(bbox[0][0], bbox[1][0]));
  result.push(Math.min(bbox[0][1], bbox[1][1]));
  result.push(Math.max(bbox[0][0], bbox[1][0]));
  result.push(Math.max(bbox[0][1], bbox[1][1]));
  return result;
}

// bbox: [[10797, 35685], [21045, 55998]]
// result: '10797 21045 35685 55998'
function re_format_polygon_bbox(bbox) {
  let result = [];
  result = bbox.flat().join(' ');
  return result;
}

// origin_bbox: '10797 55998 35685 21045'
// bbox: [[10797, 35685], [21045, 55998]]
function format_bbox(origin_bbox) {
  origin_bbox = origin_bbox.split(' ');
  return [
    [
      Math.min(origin_bbox[0], origin_bbox[2]),
      Math.min(origin_bbox[1], origin_bbox[3]),
    ],
    [
      Math.max(origin_bbox[0], origin_bbox[2]),
      Math.max(origin_bbox[1], origin_bbox[3]),
    ],
  ];
}

// origin_bbox: '10797 55998 35685 21045'
// bbox: [[10797, 35685], [21045, 55998]]
function format_polygon_bbox(origin_bbox) {
  origin_bbox = origin_bbox.split(' ');
  let result = chunk(origin_bbox, 2);
  result = result.map((item) => {
    return [toDecimal(item[0]), toDecimal(item[1])];
  });
  return result;
}

// 将数组块划分为指定大小的较小数组。
function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

// points: 30,171 147,171 147,314 30,314
// return: [[30, 171], [147, 314]]
function format_points(points) {
  let origin_points = points.split(' ');
  let set_x = new Set();
  let set_y = new Set();
  origin_points.forEach((item) => {
    let arr = item.split(',');
    set_x.add(Number(arr[0]));
    set_y.add(Number(arr[1]));
  });
  let arr_x = Array.from(set_x);
  let arr_y = Array.from(set_y);
  if (arr_x.length === 1) {
    arr_x[1] = arr_x[0];
  }
  if (arr_y.length === 1) {
    arr_y[1] = arr_y[0];
  }
  return [
    [Math.min(arr_x[0], arr_x[1]), Math.min(arr_y[0], arr_y[1])],
    [Math.max(arr_x[0], arr_x[1]), Math.max(arr_y[0], arr_y[1])],
  ];
}

// points: [[30, 171], [147, 314]]
// return: 30,171 147,171 147,314 30,314
function re_format_points(points) {
  return `${points[0][0]},${points[0][1]} ${points[1][0]},${points[0][1]} ${points[1][0]},${points[1][1]} ${points[0][0]},${points[1][1]}`;
}

// points: [[30, 171], [147, 314]]
// return: 30,171 147,314
function re_format_polygon_points(points) {
  let result = '';
  points.forEach((point) => {
    result += `${point[0]},${point[1]} `;
  });
  result = result.substring(0, result.length - 1); // 删去最后一个空格
  return result;
}

// points to bbox
// points [[100, 200], [20, 400]]
// bbox '2000 3000 2800 5500'
function pointsToBbox(points, vue) {
  let bbox_x1 = Math.min(
    d3XToCadX(points[0][0], vue),
    d3XToCadX(points[1][0], vue)
  );
  let bbox_x2 = Math.max(
    d3XToCadX(points[0][0], vue),
    d3XToCadX(points[1][0], vue)
  );
  let bbox_y1 = Math.min(
    d3YToCadY(points[0][1], vue),
    d3YToCadY(points[1][1], vue)
  );
  let bbox_y2 = Math.max(
    d3YToCadY(points[0][1], vue),
    d3YToCadY(points[1][1], vue)
  );

  let bbox = `${bbox_x1} ${bbox_y1} ${bbox_x2} ${bbox_y2}`;
  return bbox;
}

// points to bbox
// points [[100, 200], [20, 400]]
// bbox '2000 3000 2800 5500'
function polygonPointsToBbox(points, vue) {
  let result = '';
  points.forEach((point) => {
    result += `${d3XToCadX(point[0], vue)} ${d3YToCadY(point[1], vue)} `;
  });
  result = result.substring(0, result.length - 1);
  return result;
}

// bbox to points
// bbox [[10000, 20000], [2000, 40000]]
// points [[100, 200], [20, 400]]
function bboxToPoints(bbox, ratio, graph_height) {
  let points = [];
  bbox.forEach((point) => {
    points.push([
      toDecimal(point[0] / ratio),
      toDecimal(yTrans(point[1] / ratio, graph_height)),
    ]);
  });
  return points;
}

// region [[100, 200], [20, 400]]
// Polygon [[100, 200], [100, 400], [20, 400], [20, 200]]
// 控制顺序
function regionToPolygon(points) {
  let result = [];
  result.push([points[0][0], points[0][1]]);
  result.push([points[0][0], points[1][1]]);
  result.push([points[1][0], points[1][1]]);
  result.push([points[1][0], points[0][1]]);

  // points.push([points[0][0], points[1][1]]);
  // points.push([points[1][0], points[0][1]]);
  return result;
}

// Polygon bbox [[10, 200], [30, 300], [10, 300], [30, 200]]
// region bbox [[10, 200], [30, 300]]
function polygonToRegion(points) {
  let x_set = new Set();
  let y_set = new Set();
  points.forEach((point) => {
    x_set.add(point[0]);
    y_set.add(point[1]);
  });
  const arrayMax = (arr) => Math.max(...arr);
  const arrayMin = (arr) => Math.min(...arr);
  return [
    [arrayMin([...x_set]), arrayMin([...y_set])],
    [arrayMax([...x_set]), arrayMax([...y_set])],
  ];
}

// points '30,171 147,171 55,100 147,314 30,314'
// or points '30,171,147,171,55,100,147,314,30,314'
// [[30, 171], [147, 171], ...]
function format_polygon_points(points) {
  let result = [];
  let temp = points.split(' ');
  if (temp.length === 1) {
    let data = points.split(',');
    for (var i = 0; i < data.length; i += 2) {
      result.push(data.slice(i, i + 2));
    }
  } else {
    temp.forEach((item) => {
      result.push(item.split(','));
    });
  }

  result = result.map((item) => {
    return [toDecimal(item[0]), toDecimal(item[1])];
  });
  return result;
}

// 获取实际尺寸
function getActualSize(points, vue) {
  let size_x = toDecimal(
    Math.abs(d3XToCadX(points[1][0], vue) - d3XToCadX(points[0][0], vue)),
    0
  );
  let size_y = toDecimal(
    Math.abs(d3YToCadY(points[1][1], vue) - d3YToCadY(points[0][1], vue)),
    0
  );

  // 人为的取整显示
  if (size_x % 100 <= 2) {
    size_x -= size_x % 100;
  } else if (size_x % 100 >= 98) {
    size_x += 100 - (size_x % 100);
  }

  if (size_y % 100 <= 2) {
    size_y -= size_y % 100;
  } else if (size_y % 100 >= 98) {
    size_y += 100 - (size_y % 100);
  }

  return `${size_x} * ${size_y}`;
}

// d3X 转换成 cadX
function d3XToCadX(x, vue) {
  // let base_xmin = vue.navigation_bbox[0];
  // let ratio = vue.ratio;
  let ratio = vue && vue.ratio ? vue.ratio : store.state.cad.ratio;

  // return toDecimal(x * ratio + base_xmin, 0);
  return toDecimal(x * ratio, 0);
}

// d3Y 转换成 cadY
function d3YToCadY(y, vue) {
  // let base_ymin = vue.navigation_bbox[1];
  // let ratio = vue.ratio;
  let ratio = vue && vue.ratio ? vue.ratio : store.state.cad.ratio;
  let svg_height = store.state.config.graph_height;

  // return toDecimal((svg_height - y) * ratio + base_ymin, 0);
  return toDecimal((svg_height - y) * ratio, 0);
}

// 2分查找
function binarySearch(arr, key, SPACE = 5) {
  let start = 0;
  let end = arr.length - 1;

  let mid;
  while (start <= end) {
    mid = parseInt((start + end) / 2);
    if (key < arr[mid]) {
      end = mid - 1;
    } else if (key > arr[mid]) {
      start = mid + 1;
    } else if (key === arr[mid]) {
      return arr[mid]; //返回值
    }
  }

  // 没找到值后还有几种情况
  // end为-1的时候，start为0，此时则单独判断start是否在间距内
  // start > arr.length-1 的时候，此时则单独判断end是否在间距内
  if (end < 0) {
    if (Math.abs(arr[start] - key) <= SPACE) {
      return arr[start];
    } else {
      return null;
    }
  }
  if (start > arr.length - 1) {
    if (Math.abs(arr[end] - key) <= SPACE) {
      return arr[end];
    } else {
      return null;
    }
  }
  // 区间内情况
  if (Math.abs(arr[start] - key) > SPACE && Math.abs(arr[end] - key) > SPACE) {
    return null;
  } else {
    if (Math.abs(arr[start] - key) <= Math.abs(arr[end] - key)) {
      return arr[start];
    } else {
      return arr[end];
    }
  }
}

// 取精度
function toDecimal(num, s = 2, type = 'int') {
  var times = Math.pow(10, s);
  var des = num * times;
  des = Math.round(des) / times;
  return type !== 'int' ? des + '' : Number(des);
}

// 清空辅助相关
function clean(flag = true) {
  // 删除辅助点
  d3.select(`#${get_id()['assist_g']}`).remove();
  d3.select(`#${get_id()['tools_g']}`).remove();
  d3.select(`#${get_id()['temp_text']}`).text('');
  d3.selectAll(`.${get_class()['has_assist']}`).on('mousedown.drag', null); // 移除drag事件
  d3.selectAll(`.${get_class()['has_assist']}`).classed(
    get_class()['has_assist'],
    false
  );
  // 取消高亮该货架类型已经排好的货架
  flag &&
    d3
      .selectAll(`.${get_class()['storage_region']}`)
      .classed(get_class()['storage_region_active'], false);
}

// 计算bbox的面积
// bbox [[0, 0], [5000, 8000]]
// area 40
function getBboxArea(bbox) {
  let width = Math.abs(bbox[1][0] - bbox[0][0]);
  let height = Math.abs(bbox[1][1] - bbox[0][1]);
  return (width * height) / 1000000; // 单位是平方米
}

/**
 * @desc 函数防抖
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 */
function debounce(func, wait, immediate = false) {
  // let timeout = store.state.cad.zoom_timeout;
  let timeout;

  return function() {
    let context = this;
    let args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) func.apply(context, args);
    } else {
      timeout = setTimeout(function() {
        // store.commit('SET_ZOOM_TIMEOUT', timeout);
        func.apply(context, args);
      }, wait);
    }
  };
}

// 获取两个点之间的距离
function getTwoPointDistance(x1, y1, x2, y2, type = 'normal') {
  if (type === 'normal') {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  } else {
    return toDecimal(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
  }
}

// points [[20, 200], [100, 400]]
// points [[20, 200], [100, 400], [20, 400], [100,200]]
function get_detail_points(points) {
  points.push([points[0][0], points[1][1]]);
  points.push([points[1][0], points[0][1]]);
  return points;
}

function get_node_points(id) {
  let node = d3
    .select(`#${id}`)
    .node()
    .getBBox();
  return [
    [toDecimal(node.x), toDecimal(node.y)],
    [toDecimal(node.x + node.width), toDecimal(node.y + node.height)],
  ];
}

function get_model_bbox(id) {
  let bbox = get_detail_points(format_bbox(pointsToBbox(get_node_points(id))));
  return bbox;
}

// bbox to points
// bbox [[100, 200], [20, 400]]
// points [[20, 200], [100, 400]]
function BBoxtoPoints(bbox, ratio = store.state.cad.ratio) {
  let points = [];
  bbox.forEach((point) => {
    points.push([
      toDecimal(point[0] / ratio),
      toDecimal(yTrans(point[1] / ratio, store.state.config.graph_height)),
    ]);
  });

  return points;
}

// points [[100, 200], [20, 400]]
// points [[20, 200], [100, 400]]
function sort_points(points) {
  return [
    [
      Math.min(points[0][0], points[1][0]),
      Math.min(points[0][1], points[1][1]),
    ],
    [
      Math.max(points[0][0], points[1][0]),
      Math.max(points[0][1], points[1][1]),
    ],
  ];
}

// 若数量为4 并且重复组成
// polygon 原样返回
// region 则精简后返回
function sortRegionOrPolygon(bbox) {
  let is_polygon_flag = true;
  if (bbox.length === 4) {
    let x_set = new Set();
    let y_set = new Set();
    bbox.forEach((point) => {
      x_set.add(point[0]);
      y_set.add(point[1]);
    });
    if (x_set.size <= 2 && y_set.size <= 2) {
      is_polygon_flag = false;
    }
  }

  if (is_polygon_flag) {
    return bbox;
  } else {
    return polygonToRegion(bbox);
  }
}

// 转换成polygon类型的bbox
function allToPolygon(bbox) {
  if (bbox.length === 2) {
    return regionToPolygon(bbox);
  } else {
    return bbox;
  }
}

// x, y 当前点坐标
// x1, y1 先前点坐标
function judgeShiftLine(x, y, x1, y1, DIFF = 10) {
  let angle = getAngle(x1, y1, x, y);
  // 水平
  if (
    Math.abs(angle - 180) <= DIFF ||
    angle >= 360 - DIFF ||
    angle <= 0 + DIFF
  ) {
    y = y1;
    // return true;
  }
  if (Math.abs(angle - 90) <= DIFF || Math.abs(angle - 270) <= DIFF) {
    x = x1;
    // return true;
  }
  return {
    x,
    y,
  };
}

/**
 * 计算从x1y1到x2y2的直线，与水平线形成的夹角
 * 计算规则为顺时针从左侧0°到与该直线形成的夹角
 * @param {Object} x1
 * @param {Object} y1
 * @param {Object} x2
 * @param {Object} y2
 */
function getAngle(x1, y1, x2, y2) {
  var x = x1 - x2,
    y = y1 - y2;
  if (!x && !y) {
    return 0;
  }
  var angle = (180 + (Math.atan2(-y, -x) * 180) / Math.PI + 360) % 360;
  return 360 - angle; // 返回范围 0到360°
}

export {
  calculate_bbox_from_navigation,
  calculate_ratio_from_bbox,
  calculate_scale_from_bbox,
  calculate_translate_xy,
  create_random,
  judge_rect_intersect,
  format_bbox,
  re_format_bbox,
  format_points,
  re_format_points,
  pointsToBbox,
  bboxToPoints,
  d3XToCadX,
  d3YToCadY,
  binarySearch,
  toDecimal,
  getActualSize,
  regionToPolygon,
  polygonToRegion,
  clean,
  getBboxArea,
  judge_bbox_direction,
  format_direction,
  reformat_direction,
  format_polygon_points,
  debounce,
  getTwoPointDistance,
  get_node_points,
  get_model_bbox,
  get_detail_points,
  BBoxtoPoints,
  sort_points,
  re_format_polygon_points,
  polygonPointsToBbox,
  format_polygon_bbox,
  re_format_polygon_bbox,
  sortRegionOrPolygon,
  allToPolygon,
  judgeShiftLine,
};
