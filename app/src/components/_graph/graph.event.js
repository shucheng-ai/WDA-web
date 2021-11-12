import * as d3 from 'd3';
import { NewNodeGraph } from './item';
import { get_id, get_class } from '../../config/id.config';
import { toDecimal, judge_rect_intersect, debounce } from '../v2/project.utils';
import store from '../../models/store/index';

const UNDRAGMODE = ['new-polygon', 'model'];
const UNDRAGSHAPE = ['polygon'];
function svgDragEvent(svg, that, data) {
  svg.call(
    d3
      .drag()
      .on('start', function() {
        if (store.state.cad.is_zooming) {
          return false;
        }
        console.log('## d3.event: ', d3.event);

        if (that.svg.mode === 'normal') {
          MoveDragEvent.start.call(this);
        } else if (
          !UNDRAGMODE.includes(that.svg.mode) &&
          !UNDRAGSHAPE.includes(that.svg.shape)
        ) {
          console.log('that.svg.mode: ', that.svg.mode);

          console.log('that.svg.shape: ', that.svg.shape);
          let point = formatZoomPoint(d3.event);

          let node = new NewNodeGraph({
            vue: that,
            type: 'new',
            x: point.x,
            y: point.y,
          });
          node.draw();
        }
      })
      .on('drag', function() {
        if (store.state.cad.is_zooming) {
          return false;
        }
        if (that.svg.mode === 'normal') {
          MoveDragEvent.drag.call(this);
        } else if (
          !UNDRAGMODE.includes(that.svg.mode) &&
          !UNDRAGSHAPE.includes(that.svg.shape)
        ) {
          let node = new NewNodeGraph({
            vue: that,
            type: 'new',
          });
          let point = formatZoomPoint(d3.event);

          node.drag({
            x: point.x,
            y: point.y,
          });
        }
      })
      .on('end', function() {
        if (store.state.cad.is_zooming) {
          return false;
        }
        if (that.svg.mode === 'normal') {
          MoveDragEvent.end.call(this);
        } else if (
          !UNDRAGMODE.includes(that.svg.mode) &&
          !UNDRAGSHAPE.includes(that.svg.shape)
        ) {
          let node = new NewNodeGraph({
            vue: that,
            type: 'new',
          });
          node.end();
        }
      })
  );
}

const MoveDragEvent = {
  start: function() {
    d3.select(this)
      .attr('event_x', toDecimal(d3.event.x))
      .attr('event_y', toDecimal(d3.event.y));
  },
  drag: function() {
    let [transform_x, transform_y, transform_scale] = [
      toDecimal(d3.event.x) -
        toDecimal(d3.select(this).attr('event_x')) +
        toDecimal(d3.select(this).attr('transform_x')),
      toDecimal(d3.event.y) -
        toDecimal(d3.select(this).attr('event_y')) +
        toDecimal(d3.select(this).attr('transform_y')),
      d3.select(this).attr('transform_scale'),
    ];
    let transform = d3.zoomTransform(d3.select(this).node());
    transform.x = transform_x;
    transform.y = transform_y;
    transform.k = transform_scale;
    d3.select(this).attr('transform', transform);
  },
  end: function() {
    let [transform_x, transform_y] = [
      toDecimal(d3.event.x) -
        toDecimal(d3.select(this).attr('event_x')) +
        toDecimal(d3.select(this).attr('transform_x')),
      toDecimal(d3.event.y) -
        toDecimal(d3.select(this).attr('event_y')) +
        toDecimal(d3.select(this).attr('transform_y')),
    ];

    d3.select(this)
      .attr('event_x', 0)
      .attr('event_y', 0)
      .attr('transform_x', transform_x)
      .attr('transform_y', transform_y);
  },
};

function StorageImgDragEvent(svg, that, data) {
  svg.call(
    d3
      .drag()
      .on('start', function() {})
      .on('drag', function() {
        d3.select(this)
          .attr('x', function() {
            return toDecimal(d3.event.x - 25);
          })
          .attr('y', function() {
            return toDecimal(d3.event.y - 25);
          });
      })
      .on('end', function() {
        let region_nodes = d3.selectAll(`.${get_class()['region']}`).nodes();
        let scale = parseFloat(
          d3.select(`#${get_id()['g']}`).attr('transform_scale')
        );
        // 要注意缩放时
        let [imgx, imgy, storage_id, storage_group_id] = [
          (parseFloat(d3.select(this).attr('x')) -
            parseFloat(d3.select(`#${get_id()['g']}`).attr('transform_x'))) /
            scale,
          (parseFloat(d3.select(this).attr('y')) -
            parseFloat(d3.select(`#${get_id()['g']}`).attr('transform_y'))) /
            scale,
          parseFloat(d3.select(this).attr('storage_id')),
          parseFloat(d3.select(this).attr('storage_group_id')),
        ];
        let img_node = d3
          .select(this)
          .node()
          .getBBox();
        img_node.x = imgx;
        img_node.y = imgy;
        // 宽高也要按比例变化
        img_node.width /= scale;
        img_node.height /= scale;

        let regions = [];
        region_nodes.some((region_item) => {
          let region_bbox = d3.select(region_item).attr('points');
          let region_id = d3.select(region_item).attr('region_id');
          // region_bbox = region_bbox.split(' ');
          const s = new Set();
          region_bbox.split(/\s+|,/).forEach((item) => {
            item && s.add(parseFloat(item));
          });
          // region_bbox.map((item) => {
          //   s.add(item.split(/\s+|,/)); //TODO 转化类型
          //   // return parseFloat(item);
          // });
          region_bbox = Array.from(s);
          // if (region_bbox[0] > region_bbox[2]) {
          //   [region_bbox[0], region_bbox[2]] = [region_bbox[2], region_bbox[0]];
          // }
          // if (region_bbox[1] > region_bbox[3]) {
          //   [region_bbox[1], region_bbox[3]] = [region_bbox[3], region_bbox[1]];
          // }
          let [xmin, ymin, xmax, ymax] = [
            parseFloat(
              region_bbox[0] > region_bbox[2] ? region_bbox[2] : region_bbox[0]
            ),
            parseFloat(
              region_bbox[1] > region_bbox[3] ? region_bbox[3] : region_bbox[1]
            ),
            parseFloat(
              region_bbox[0] < region_bbox[2] ? region_bbox[2] : region_bbox[0]
            ),
            parseFloat(
              region_bbox[1] < region_bbox[3] ? region_bbox[3] : region_bbox[1]
            ),
          ];
          let rs = judge_rect_intersect(
            img_node,
            d3
              .select(region_item)
              .node()
              .getBBox()
          );
          // 更换判断方式，交叉即可
          if (rs) {
            regions.push(region_id);
          }

          // if (imgx >= xmin && imgx <= xmax && imgy >= ymin && imgy <= ymax) {
          //   regions.push(region_id);
          // }
        });

        // clean node/data return {regions, imgid}
        if (regions.length > 0) {
          that.calculateStorageRegion(
            storage_id,
            storage_group_id,
            regions,
            this
          );
          // d3.select(this).remove();
        } else {
          // 移动到区域外则移回原位
          setTimeout(() => {
            that.$message.warning(
              'Storage did not drag properly to the region area'
            );
            d3.select(this)
              .attr('x', d3.select(this).attr('origin_x'))
              .attr('y', d3.select(this).attr('origin_y'));
          }, 500);
        }
      })
  );
}

function svgZoomEvent(svg, that, data) {
  // 当缩放触发元素和被操作元素不是同一个元素时，就可以做到按鼠标点为中心进行缩放
  // 初始倍数 [0.5, 10]
  let times = toDecimal(that.ratio / that.origin_ratio, 4);
  // console.log('that.ratio: ', that.ratio);
  // console.log('times: ', times);
  // let transform_x = d3.select(`#${data.id}`).attr('transform_x');
  // console.log('transform_x: ', transform_x);
  // let transform_y = d3.select(`#${data.id}`).attr('transform_y');
  // console.log('transform_y: ', transform_y);
  // let transform_scale = d3.select(`#${data.id}`).attr('transform_scale');
  // console.log('transform_scale: ', transform_scale);

  const MIN = 0.02;
  const MAX = 50; // CAD解析可能出现较小图层
  let scaleExtent = [MIN * times, times * MAX];
  console.log('scaleExtent: ', scaleExtent);
  svg.call(
    d3
      .zoom()
      .scaleExtent(scaleExtent)
      .on('start', start)
      .on('zoom', zoomed)
      .on('end', end)
  );
  svg.on('dblclick.zoom', null); //禁用双击缩放事件
  // TODO 拖拽平移的时候会有抖动感(部分原因是transform 取整造成的)
  svg.on('mousedown.zoom', null); //禁用拖拽平移事件

  function zoomed() {
    // svg进行transform偏移的时候，是对元素所在的坐标系做整体偏移，所以元素的.node().getBBox()的x y 宽 高等信息都不变
    d3.event.transform.x = toDecimal(d3.event.transform.x);
    d3.event.transform.y = toDecimal(d3.event.transform.y);
    d3.select(`#${data.id}`).attr('transform', d3.event.transform);

    redraw(get_id()['g'], that);
  }
  function start() {
    console.log('UPDATE_IS_ZOOMING start');
    store.commit('UPDATE_IS_ZOOMING', true);

    d3.select(`#${data.id}`)
      .attr('relative_x', 0)
      .attr('relative_y', 0)
      .attr('event_x', toDecimal(d3.event.transform.x))
      .attr('event_y', toDecimal(d3.event.transform.y));
  }
  function end() {
    let [transform_x, transform_y] = [
      toDecimal(d3.event.transform.x),
      toDecimal(d3.event.transform.y),
    ];
    d3.select(`#${data.id}`)
      .attr(
        'relative_x',
        toDecimal(d3.event.transform.x) -
          toDecimal(d3.select(`#${data.id}`).attr('event_x'))
      )
      .attr(
        'relative_y',
        toDecimal(d3.event.transform.y) -
          toDecimal(d3.select(`#${data.id}`).attr('event_y'))
      )
      .attr('event_x', 0)
      .attr('event_y', 0)
      .attr('transform_x', transform_x)
      .attr('transform_y', transform_y)
      .attr('transform_scale', d3.event.transform.k);

    redraw(get_id()['g'], that);
  }
}

const ZOOM_REDRAW_FACTOR = 0.01; //0.3 缩放scale 与 1 相差大于缩放因子时则需要重绘
// TODO 待优化
// 只缩放了一点就不重绘了，缩放后且马上拖拽的也需要运行本函数
let redraw = debounce((id = get_id()['g'], that) => {
  let scale = d3.select(`#${id}`).attr('transform_scale');
  let ratio = (that.ratio * that.unredraw_scale) / scale;
  console.log('======scale: ', scale);
  console.log('==========ratio: ', ratio);

  that.ratio = ratio;
  if (Math.abs(scale - 1) >= ZOOM_REDRAW_FACTOR) {
    that.reset('redraw');
    that.unredraw_scale = 1;
  } else {
    store.commit('UPDATE_IS_ZOOMING', false);
    that.unredraw_scale = scale;
  }
}, 200);

function formatZoomPoint(point, g_id = get_id()['g']) {
  let transform = d3.zoomTransform(d3.select(`#${g_id}`).node());
  // console.log('transform: ', transform);
  let result = {};
  result['x'] = toDecimal((point.x - transform.x) / transform.k);
  result['y'] = toDecimal((point.y - transform.y) / transform.k);
  return result;
}

function svgContextmenuEvent(svg, that, func) {
  svg.on('contextmenu', function() {
    func();
    d3.event.preventDefault();
  });
}

function svgClickEvent(svg, that, func) {
  svg.on('click', function() {
    // console.log('d3.event: ', d3.event);
    d3.event.stopPropagation(); //阻止冒泡
    func();
  });
}

function svgDbclickEvent(svg, that, func) {
  svg.on('dblclick', function() {
    // console.log('d3.event: ', d3.event);
    d3.event.stopPropagation(); //阻止冒泡
    func();
  });
}

function svgMousemoveEvent(svg, that, func) {
  svg.on('mousemove', function() {
    // console.log('d3.event: ', d3.event);
    d3.event.stopPropagation(); //阻止冒泡
    func();
  });
}
export {
  svgDragEvent,
  StorageImgDragEvent,
  svgZoomEvent,
  svgContextmenuEvent,
  svgClickEvent,
  formatZoomPoint,
  svgDbclickEvent,
  svgMousemoveEvent,
};
