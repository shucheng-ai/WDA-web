import './graph.css';
import BaseGraph from './base';
import { addSVG } from '../sc-graph/svg';
import { addRect } from '../sc-graph/rect';
import { addLine } from '../sc-graph/line';
import { yTrans } from '../sc-graph/utils';
import { get_model } from '../../config/model.config';

import {
  svgDragEvent,
  StorageImgDragEvent,
  svgZoomEvent,
  svgClickEvent,
  formatZoomPoint,
  svgMousemoveEvent,
  svgDbclickEvent,
  svgContextmenuEvent,
} from './graph.event';
import {
  toDecimal,
  format_polygon_points,
  clean,
  getTwoPointDistance,
  get_node_points,
  re_format_points,
  get_model_bbox,
  format_points,
  sort_points,
  polygonPointsToBbox,
  format_polygon_bbox,
  judgeShiftLine,
} from '../v2/project.utils';

import { PolygonGraph } from './polygon';
import { LineGraph } from './line';
import { addAssistPoints, addAssistLines } from './item.event';

import { get_id, get_class } from '../../config/id.config';
import { color_config } from '../../config/color.config';

import * as d3 from 'd3';

import palletImg from '../../assets/images/pallet.png';
import store from '../../models/store/index';
import Adsorb from './adsorb';
import PointAdsorb from './point.adsorb';

const FUNCSHAPE = ['line', 'polygon'];

class SvgGraph extends BaseGraph {
  constructor(config) {
    let svg_config = {
      svg_width: config.width,
      svg_height: config.height,
    };
    svg_config.svg_id = get_id()['svg'];
    svg_config.father = 'svg';
    svg_config.svg_class = get_class()['svg'];
    super(svg_config, config);
    this.title = 'svg';
  }

  draw() {
    // 添加底层svg
    let svg = addSVG.call(this, this.svg_config);
    let g = svg
      .append('g')
      .attr('id', get_id()['g'])
      .attr('transform_x', 0)
      .attr('transform_y', 0)
      .attr('transform_scale', 1);
    let path_g = g.append('g').attr('id', get_id()['path_g']);
    this.svg = svg;
    this.g = g;

    // 画各个大类小类的newnode-g
    store.state.config.graph_operations.forEach((graph) => {
      if (Array.isArray(graph.data)) {
        let group = path_g
          .append('g')
          .attr('id', get_id(graph.id.toUpperCase())['newnode_group_g'])
          .attr('class', get_class()['newnode_group_class']);
        graph.data.forEach((item) => {
          group
            .append('g')
            .attr('id', get_id(item.id.toUpperCase())['newnode_item_g'])
            .attr('class', get_class()['newnode_item_class']);
        });
      } else {
        let group = path_g
          .append('g')
          .attr('id', get_id(graph.id.toUpperCase())['newnode_group_g'])
          .attr('class', get_class()['newnode_group_class']);
        group
          .append('g')
          .attr('id', get_id(graph.data.id.toUpperCase())['newnode_item_g'])
          .attr('class', get_class()['newnode_item_class']);
      }
    });

    let polygon_g = g.append('g').attr('id', get_id()['polygon_g']);
    let polygon;
    // let polygon = polygon_g
    //   .append('polygon') //添加一个矩形
    //   .attr('id', get_id()['the_polygon'])
    //   .attr('tabindex', -1) // 可键盘
    //   .attr('stroke', color_config()['polygon'])
    //   .attr('stroke-width', '2px')
    //   .attr('fill-opacity', 0);

    let that = this;

    let input_focus = function() {
      d3.select(`#${get_id()['polygon_input']}`)
        .node()
        .focus();
    };

    let input_blur = function() {
      d3.select(`#${get_id()['polygon_input']}`)
        .node()
        .blur();
    };

    let input_select = function() {
      d3.select(`#${get_id()['polygon_input']}`)
        .node()
        .select();
    };

    // g 绑定拖拽，缩放事件
    this.bindEvent(g, svgDragEvent, this.vue, { id: get_id()['g'] });
    this.bindEvent(svg, svgZoomEvent, this.vue, {
      id: get_id()['g'],
      g: this.g,
    });

    // 下面mousemove和dbclick和click都是画polygon会用到的
    let current_polygon_node = null;
    let current_line_node = null;

    let pointAdsorb = new PointAdsorb({
      vue: that.vue,
    });
    this.bindEvent(svg, svgMousemoveEvent, this.vue, function() {
      // let flag = that.vue.svg.shape !== 'polygon';
      let flag = !FUNCSHAPE.includes(that.vue.svg.shape);

      if (that.vue.svg.shape === 'line') {
        if (store.state.cad.is_line_closed !== 'open' || flag) {
          return false;
        }

        let event = formatZoomPoint({ x: d3.event.layerX, y: d3.event.layerY });

        // 先判断shift 相关逻辑
        if (d3.event.shiftKey) {
          let { x1, y1 } = current_line_node.getData();
          event = judgeShiftLine(event.x, event.y, x1, y1);
        }

        // 吸附到线段上
        let rp = pointAdsorb.check(event.x, event.y);
        event.x = rp[0];
        event.y = rp[1];
        current_line_node.end(event.x, event.y);
      } else if (that.vue.svg.shape === 'polygon') {
        if (store.state.cad.is_polygon_closed !== 'open' || flag) {
          return false;
        } else {
          polygon = d3.select(`#${store.state.cad.edit_polygon_id}`);
        }

        let points;
        if (polygon) {
          points = polygon.attr('holdpoints');
        }

        if (flag || points == null || points.length < 1) {
          return false;
        }

        // 小于三个点的时候为线
        points = format_polygon_points(points);
        // MouseEvent 和 DragEvent 的x和y取值来源不太一样，但是都是以与和layerX相同为标准
        let event = formatZoomPoint({ x: d3.event.layerX, y: d3.event.layerY });

        // 吸附到线段上
        let rp = pointAdsorb.check(event.x, event.y);
        event.x = rp[0];
        event.y = rp[1];

        points.push([event.x, event.y]);
        polygon.attr('points', points);

        let polygon_box = d3.select(`#${get_id()['polygon_box']}`);

        if (points.length > 1) {
          // 更新input 距离
          let distance = getTwoPointDistance(
            polygon_box.attr('start_x'),
            polygon_box.attr('start_y'),
            event.x,
            event.y,
            'format'
          );

          d3.select(`#${get_id()['polygon_input']}`).attr(
            'value',
            distance * that.vue.ratio
          );
          // TODO （通过JS赋值和input输入）会导致input上 target.value 和属性value不同的情况
          document.getElementById(get_id()['polygon_input']).value =
            distance * that.vue.ratio;

          // console.log('distance: ', distance);
          // console.log(
          //   'value: ',
          //   d3.select(`#${get_id()['polygon_input']}`).attr('value')
          // );
          input_focus();
        }

        // let input_x = (Number(polygon_box.attr('start_x')) + event.x) / 2;
        // let input_y = (Number(polygon_box.attr('start_y')) + event.y) / 2;

        // 不挡住线
        let t_x = event.x > Number(polygon_box.attr('start_x')) ? -50 : 20;
        let t_y = event.y > Number(polygon_box.attr('start_y')) ? -50 : 20;
        let input_x = Number(polygon_box.attr('start_x')) + t_x;
        let input_y = Number(polygon_box.attr('start_y')) + t_y;
        // input_focus();
        input_select();

        polygon_box
          .attr('x', input_x)
          .attr('y', input_y)
          .attr('move_x', event.x)
          .attr('move_y', event.y);
      }
    });

    this.bindEvent(svg, svgDbclickEvent, this.vue, function() {
      // 触发双击事件前，会先触发两次click事件。可以通过定时器延时执行单机事件或者在双击事件中特殊处理
      // let flag = that.vue.svg.mode !== 'new-polygon';
      let flag = that.vue.svg.shape !== 'polygon';

      if (store.state.cad.is_polygon_closed !== 'open') {
        return false;
      } else {
        polygon = d3.select(`#${store.state.cad.edit_polygon_id}`);
      }

      let points = polygon.attr('points');
      console.log('dbclick: ', points);

      if (flag || points == null || points.length < 1) {
        return false;
      }
      points = format_polygon_points(points);
      console.log('before: ', points);
      let _points = points.slice(0, -1); // 移除双击事件触发的click事件的点
      let _bbox = polygonPointsToBbox(_points, that.vue);
      console.log('_bbox: ', _bbox);
      polygon
        .attr('points', _points)
        .attr('bbox', _bbox)
        .attr('holdpoints', []); // 结束绘制 清空临时点

      d3.select(`#${get_id()['polygon_box']}`)
        .attr('start_x', _points[_points.length - 1][0])
        .attr('start_y', _points[_points.length - 1][1]);

      // 将点保存起来
      let mode = that.vue.svg.mode.split('-');
      mode = mode[mode.length - 1];

      that.vue.new_node = {
        data: {
          // id: store.state.cad.edit_polygon_id,
          id: store.state.cad.edit_polygon_id.split('-')[2],
          bbox: format_polygon_bbox(_bbox),
          direction: null,
          _direction: null,
        },
        points: _points,
        id: store.state.cad.edit_polygon_id,
        type: mode,
      };

      console.log('that.vue.new_node: ', that.vue.new_node);
      that.vue.addNewNode();

      that.vue.svg.mode = 'normal';
      g.style('cursor', 'default');
      d3.select(`#${get_id()['polygon_box']}`).remove();

      store.commit('SET_EDIT_POLYGON_ID', '');
      store.commit('SET_IS_POLYGON_CLOSED', 'new');

      console.log('current_polygon_node: ', current_polygon_node);
      current_polygon_node.bindSomeEvent();
    });
    this.bindEvent(g, svgClickEvent, this.vue, function() {
      // let flag = that.vue.svg.shape !== 'polygon';
      let flag = !FUNCSHAPE.includes(that.vue.svg.shape);

      if (flag) {
        clean();
        that.vue.clickMain(d3.event);
      } else {
        console.log('that.vue: ', that.vue);
        if (that.vue.svg.shape === 'line') {
          let event = formatZoomPoint({
            x: d3.event.layerX,
            y: d3.event.layerY,
          });
          console.log('sss [event.x, event.y]: ', [event.x, event.y]);

          // 先判断shift 相关逻辑
          if (d3.event.shiftKey && store.state.cad.is_line_closed === 'open') {
            let { x1, y1 } = current_line_node.getData();
            event = judgeShiftLine(event.x, event.y, x1, y1);
          }

          pointAdsorb.start();
          let rp = pointAdsorb.check(event.x, event.y, true);
          event.x = rp[0];
          event.y = rp[1];

          const escFunction = (e) => {
            if (
              e.key === 'Escape' &&
              store.state.cad.is_line_closed === 'open'
            ) {
              // 删除这个line
              d3.select(`#${store.state.cad.edit_line_id}`).remove();
              // 删除距离文字
              d3.select(
                `#${get_id(store.state.cad.edit_line_id)['line_text']}`
              ).remove();
              // 结束绘制
              store.commit('SET_IS_LINE_CLOSED', 'new');
              store.commit('SET_EDIT_LINE_ID', null);
            }
          };

          // 新建line
          if (store.state.cad.is_line_closed === 'new') {
            current_line_node = new LineGraph({
              vue: that.vue,
              father_id: get_id()['path_g'],
            });
            let new_id = current_line_node.init(event.x, event.y);

            store.commit('SET_EDIT_LINE_ID', new_id);
            store.commit('SET_IS_LINE_CLOSED', 'open');

            // 键盘监听 ESC
            // keypress 事件无法监听到ESC按键
            window.addEventListener('keydown', escFunction);
          } else {
            // 追加点
            current_line_node.end(event.x, event.y);
            that.vue.lines.push(current_line_node.getData());
            store.commit('SET_IS_LINE_CLOSED', 'new');
            store.commit('SET_EDIT_LINE_ID', null);

            that.vue.svg.shape = 'normal';

            // 移除键盘监听事件
            window.removeEventListener('keydown', escFunction);
          }
        } else {
          let mode = that.vue.svg.mode.split('-');
          mode = mode[mode.length - 1];

          // 新建polygon
          if (store.state.cad.is_polygon_closed === 'new') {
            that.vue[`${mode}s_count`] += 1;
            let data_id = that.vue[`${mode}s_count`];
            let new_id = get_id(mode.toUpperCase(), data_id)['newnode_mode_id'];
            // 不能新建的时候就绑定事件，会发生事件冲突

            current_polygon_node = new PolygonGraph({
              vue: that.vue,
              type: 'new',
              data_id: data_id,
              mode: mode,
            });
            current_polygon_node.init();
            polygon = d3.select(`#${new_id}`);

            store.commit('SET_EDIT_POLYGON_ID', new_id);
            store.commit('SET_IS_POLYGON_CLOSED', 'open');
          } else {
            // 追加点
            polygon = d3.select(`#${store.state.cad.edit_polygon_id}`);
          }
          console.log('polygon: ', polygon);

          // 小于三个点的时候为线
          let points = polygon.attr('points');
          console.log('before format: ', points);
          if (points == null) {
            points = [];
          } else {
            points = format_polygon_points(points);
          }
          g.style('cursor', 'crosshair');
          console.log('click before: ', points.flat(1));
          console.log('click: ', d3.event);
          if (points.length === 0) {
            // MouseEvent 和 DragEvent 的x和y取值来源不太一样，但是都是以与和layerX相同为标准
            let event = formatZoomPoint({
              x: d3.event.layerX,
              y: d3.event.layerY,
            });
            console.log('sss [event.x, event.y]: ', [event.x, event.y]);

            pointAdsorb.start();
            // 吸附到线段上
            let rp = pointAdsorb.check(event.x, event.y);
            event.x = rp[0];
            event.y = rp[1];
            points.push([event.x, event.y]);
            console.log('eee [event.x, event.y]: ', [event.x, event.y]);
            console.log('click after: ', points.flat(1));

            // 生成input
            d3.select(`#${get_id()['path_g']}`)
              .append('foreignObject')
              .attr('id', get_id()['polygon_box'])
              .attr('x', event.x + 5)
              .attr('y', event.y + 5)
              .attr('start_x', event.x)
              .attr('start_y', event.y)
              .attr('y', event.y + 5)
              .attr('width', 70)
              .attr('height', 30)
              .append('xhtml:form')
              .append('input')
              .attr('type', 'number')
              .attr('value', '')
              .attr('id', get_id()['polygon_input'])
              .on('blur', function() {
                console.log('blur ', d3.event.target.value);
                if (d3.event.target.value !== 0) {
                  // setTimeout(() => {
                  //   d3.select(`#${get_id()['polygon_box']}`).remove();
                  // }, 400);
                  d3.select(`#${get_id()['polygon_input']}`).attr('value', '0');
                }
              })
              // .on('input', function() {
              //   console.log('input ', d3.event);
              // })
              // .on('change', function() {
              //   console.log('change ', d3.event);
              //   d3.event.target.value = d3
              //     .select(`#${get_id()['polygon_input']}`)
              //     .attr('value');
              // })
              .on('keypress', function() {
                var e = d3.event;
                console.log('e.keyCode: ', e.keyCode);
                if (e.keyCode === 13) {
                  d3.event.preventDefault();
                  // 输入实际的 单位mm
                  console.log(d3.event.target.value);
                  let value = Number(d3.event.target.value) / that.vue.ratio;
                  let polygon_box = d3.select(`#${get_id()['polygon_box']}`);

                  let result = that.vue.queryPointForDistance(
                    polygon_box.attr('start_x') * 1,
                    polygon_box.attr('start_y') * 1,
                    polygon_box.attr('move_x') * 1,
                    polygon_box.attr('move_y') * 1,
                    value * 1
                  );
                  console.log('result: ', result);
                  // TODO 添加一个点
                  let new_points = format_polygon_points(
                    polygon.attr('holdpoints')
                  );
                  new_points.push([result.x, result.y]);

                  d3.select(`#${get_id()['polygon_box']}`)
                    .attr('start_x', result.x)
                    .attr('start_y', result.y);
                  polygon
                    .attr('points', new_points)
                    .attr('holdpoints', new_points);

                  d3.select(`#${get_id()['polygon_input']}`).attr('value', 0);

                  document.getElementById(get_id()['polygon_input']).value = 0;

                  input_focus();
                }
              });

            setTimeout(() => {
              input_focus();
              input_select();
              // d3.select(`#${get_id()['polygon_input']}`)
              //   .node()
              //   .focus();
              // d3.select(`#${get_id()['polygon_input']}`)
              //   .node()
              //   .select();
            }, 400);
          } else {
            console.log('points: ', points); //TODO
            let event = formatZoomPoint({
              x: d3.event.layerX,
              y: d3.event.layerY,
            });
            console.log('sss [event.x, event.y]: ', [event.x, event.y]);

            pointAdsorb.start();
            let rp = pointAdsorb.check(event.x, event.y);
            event.x = rp[0];
            event.y = rp[1];
            console.log('eee [event.x, event.y]: ', [event.x, event.y]);
            d3.select(`#${get_id()['polygon_box']}`)
              .attr('start_x', event.x)
              .attr('start_y', event.y);
          }
          polygon.attr('points', points).attr('holdpoints', points);

          input_focus();
          input_select();
        }
      }
    });

    return [svg, g, path_g];
  }

  translate(x, y, scale) {
    let transform = d3.zoomTransform(d3.select(`#${get_id()['g']}`).node());
    transform.x = x;
    transform.y = y;
    transform.k = scale;
    d3.select(`#${get_id()['g']}`)
      .attr('transform_x', x)
      .attr('transform_y', y)
      .attr('transform_scale', scale)
      .attr('transform', transform);
    //   .attr('transform', function() {
    //     //   return 'translate(' + x + ',' + y + ')' + 'scale(' + 1 + ',' + 1 + ')';
    //   });
  }
}

class BboxGraph extends BaseGraph {
  constructor(config) {
    let svg_config = {
      svg_father: config.svg,
    };
    let width = config.data[2] - config.data[0];
    let height = config.data[3] - config.data[1];
    svg_config.svg_width = width / config.ratio;
    svg_config.svg_height = height / config.ratio;
    svg_config.svg_id = config.id ? config.id : get_id()['bbox'];
    svg_config.svg_class = config.class ? config.class : get_class()['bbox'];
    svg_config.svg_x = config.data[0] / config.ratio;
    svg_config.svg_y = config.data[1] / config.ratio;
    svg_config.bbox = config.data;
    super(svg_config, config);
    this.title = 'bbox';
  }

  draw() {
    let rect = addRect(this.svg_config, this.config.config.graph_height);
    return rect;
  }
}

class TopViewGraph extends BaseGraph {
  constructor(config) {
    let svg_config = {
      svg_father: config.svg,
      stroke_width: 1,
    };

    svg_config.svg_class = get_class()['topview'];
    if (config.data.storage_id) {
      svg_config.svg_class += ` ${
        get_class(config.data.storage_id)['topview_sid']
      } ${
        get_class(config.data.storage_id, config.data.regions_id)[
          'topview_sid_rid'
        ]
      }`;
      console.log('svg_config.svg_class: ', svg_config.svg_class);
      // svg_config.svg_class += ` storage-topview-${config.data.storage_id}-${config.data.regions_id}`;
    }
    super(svg_config, config);
    this.title = this.title ? this.title : get_id()['g_topview'];
    this.classes = config.classes ? config.classes : '';
    this.data = config.data;
  }

  draw() {
    let line_config = this.svg_config;

    let svg = this.svg_config.svg_father;
    let g = svg.append('g');
    let gid = this.title.toUpperCase();
    g.attr('id', gid).attr('class', this.classes);

    line_config.svg_father = g;

    let data = this.data;
    data.forEach((_data) => {
      // let points = _data.points;
      this.count += 1;
      line_config.color = _data.color;
      let points = [];
      _data.points.forEach((point) => {
        points.push([
          toDecimal(point[0] / this.ratio),
          toDecimal(
            yTrans(point[1] / this.ratio, this.config.config.graph_height)
          ),
        ]);
      });
      line_config.svg_id = `D3-LINE-${this.random}-${this.count}`;
      line_config.points = points;
      addLine(line_config);
    });
  }
}

class StorageImgGraph extends BaseGraph {
  /*
   * 右侧storage tab，添加新storage同步添加img node
   * storage img 中点 x-25，y-25
   * */
  constructor(config) {
    let svg_config = {
      svg_father: config.svg,
      width: 50,
      height: 50,
      url: palletImg,
      class: get_class()['storage_img'],
      x: config.x,
      svg_id: `STORAGE-IMG-${config.id}`,
    };
    super(svg_config, config);
    this.vue = config.vue;
    this.storage_id = config.id;
    this.storage_group_id = config.group_id;
  }

  draw() {
    const png_config = this.svg_config;
    let storage = this.svg_config.svg_father
      .append('svg:image')
      .attr('id', png_config.svg_id)
      .attr('storage_id', this.id)
      .attr('storage_group_id', this.storage_group_id)
      .attr('xlink:href', png_config.url)
      .attr('width', png_config.width)
      .attr('height', png_config.height)
      .attr('class', png_config.class)
      .attr('x', png_config.x)
      .attr('y', 40)
      .attr('origin_x', png_config.x)
      .attr('origin_y', 40);
    // 新建元素后绑定拖拽事件
    this.bindEvent(storage, StorageImgDragEvent, this.vue, {});
  }
}

class ModelGraph extends BaseGraph {
  /*
   * 右侧storage tab，添加新storage同步添加img node
   * storage img 中点 x-25，y-25
   * */
  constructor(config) {
    let svg_config = {
      svg_father: config.svg,
      // width: 32,
      // height: 32,

      name: config.name,
      class: get_class()['model_svg'],
      x: config.x,
      y: config.y,
      type: config.type,
      svg_id: get_id(config.id)['model_svg'],
    };
    console.log('config: ', config);
    super(svg_config, config);
    this.vue = config.vue;
    this.width = toDecimal(config.width / this.vue.ratio);
    this.height = toDecimal(config.height / this.vue.ratio);
    this.points = config.points;
    this.type = config['type']; //  new redraw;
    this.model_id = `${config.name}-${config.id}`;
    this.customizable = config['customizable'];
    this.direction = config.direction;
  }

  draw() {
    let x, y, model_info;
    if (this.type === 'new') {
      let transform_x = d3.select(`#${get_id()['g']}`).attr('transform_x');
      let transform_y = d3.select(`#${get_id()['g']}`).attr('transform_y');
      let transform_scale = d3
        .select(`#${get_id()['g']}`)
        .attr('transform_scale');
      // TODO 现在transform_scale都为1了
      x = this.svg_config.x - transform_scale * transform_x - 10; // 10左边的padding
      y = this.svg_config.y - transform_scale * transform_y - 50 - 42; // 分别为svg box上面的导航栏和top-box的高度
      console.log('this.svg_config: ', this.svg_config);
    } else {
      x = this.svg_config.x;
      y = this.svg_config.y;
      store.state.animation.fixtures.forEach((fixture) => {
        if (fixture.id === this.model_id) {
          model_info = fixture;
        }
      });
    }

    let g = this.svg_config.svg_father
      .append('g')
      .attr('id', this.model_id)
      .attr('class', get_class(this.customizable)['customizable'])
      .style('pointer-events', 'bounding-box');
    let model = g.html(
      get_model({
        x,
        y,
        width: this.width,
        height: this.height,
        direction: this.direction,
      })[this.svg_config.name]
    );
    console.log('this.width: ', this.width);
    console.log('this.height: ', this.height);

    console.log('model: ', model);

    if (this.type === 'new') {
      model_info = store.state.animation.temp_model;
      // model_info.points = get_detail_points(format_bbox(pointsToBbox(get_node_points(this.model_id))));
      model_info.points = get_model_bbox(this.model_id);
      model_info.id = this.model_id;
      // 保存数据
      // store.commit('ADD_FIXTURES', model_info)
      store.dispatch('add_model', model_info);
    }

    let that = this;
    that.vue.new_node = {};
    that.vue.new_node.id = that.model_id;
    let isDraging = false;
    // 新建元素后绑定拖拽事件
    // this.bindEvent(g, svgDbclickEvent, that.vue, function() {
    //   return false; // TODO 屏蔽双击事件
    //   if (isDraging) {
    //   }

    //   console.log('svgDbclickEvent');
    //   // store.commit('SET_SHOW_EDIT_MODEL', true);

    //   store.commit('SET_TEMP_MODEL', {
    //     update: true,
    //     id: that.model_id,
    //   });

    //   let mode_info = store.state.animation.temp_model;
    //   that.vue.$confirm({
    //     title: `Are you sure delete this ${mode_info.model}?`,
    //     okText: 'Yes',
    //     okType: 'danger',
    //     cancelText: 'No',
    //     onOk() {
    //       console.log('OK');
    //       // 删除
    //       store.commit('DELETE_FIXTURE', mode_info.id);
    //       d3.select(`#${mode_info.id}`).remove();
    //       d3.select(`#${get_id()['assist_g']}`).remove();
    //       store.dispatch('post_model_info');
    //     },
    //     onCancel() {
    //       console.log('Cancel');
    //     },
    //   });
    // });
    this.bindEvent(g, svgClickEvent, that.vue, function() {
      console.log('that.model_id: ', that.model_id);
      console.log('click model: ', g);
      that.vue.svg.mode = 'model';
      // store.commit('SET_MODE', 'model');
      addAssistPoints(that.model_id, that.vue, 'model');
      d3.select(`#${that.model_id}`).classed(get_class()['has_assist'], true);

      that.adsorb = new Adsorb({
        vue: that.vue,
        isExcluded: false,
        mode: 'model',
        type: 'translate',
      });

      // 绑定拖拽事件
      let has_assist = false;
      let s_x = 0;
      let s_y = 0;
      g.call(
        d3
          .drag()
          .on('start', function() {
            isDraging = true;
            console.log('=========start: ', that.model_id);
            console.log('node: ', this.getBBox());
            d3.select(`#${get_id()['assist_g']}`).remove();
            has_assist = d3
              .select(`#${that.model_id}`)
              .classed(get_class()['has_assist']);
            if (!has_assist) return;
            // d3.select(`#${get_id()['temp_text']}`).text('');

            let points = get_node_points(that.model_id);
            d3.select(`#${that.model_id}`).attr(
              'points',
              re_format_points(points)
            );
            // 画水平垂直辅助线
            addAssistLines(
              d3.select(`#${get_id()['path_g']}`),
              this.getBBox(),
              color_config()['model']
            );

            // 吸附开始
            that.adsorb.drag_start(that.model_id, d3.event);
            s_x = d3.event.x;
            s_y = d3.event.y;

            console.log('points start: ', points.flat(1));
          })
          .on('drag', function() {
            if (!has_assist) return;

            let point = d3.event;

            let points = format_points(
              d3.select(`#${that.model_id}`).attr('points')
            );

            let adsorb = that.adsorb.drag(point, points, 0, 0);
            if (adsorb) {
              points = sort_points(adsorb);
            }
          })
          .on('end', function() {
            if (!has_assist) return;
            setTimeout(() => {
              isDraging = false;
            }, 300);

            let points = format_points(
              d3.select(`#${that.model_id}`).attr('points')
            );
            console.log('points end: ', points.flat(1));

            // 将节点更新保存
            console.log('========将节点更新保存', that.model_id);

            store.dispatch('update_model', that.model_id);

            d3.select(`#${get_id()['assist_g']}`).remove();
            d3.select(`#${get_id()['assist_line_g']}`).remove();
            addAssistPoints(that.model_id, that.vue, 'mode');
          })
      );

      d3.event.stopPropagation(); //阻止冒泡
    });

    this.bindEvent(g, svgContextmenuEvent, that.vue, function() {
      store.commit('SET_SHOW_EDIT_MODEL', true);

      store.commit('SET_TEMP_MODEL', {
        update: true,
        id: that.model_id,
      });
    });

    return model;
  }
}

export {
  BaseGraph,
  SvgGraph,
  BboxGraph,
  TopViewGraph,
  StorageImgGraph,
  ModelGraph,
};
