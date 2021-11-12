/*
 * 添加polygon
 *
 **/
import BaseGraph from './base';
import { NewNodeGraph } from './item';
import * as d3 from 'd3';
import { color_config } from '../../config/color.config';
import { ToolsGraph } from './tools';

import {
  create_random,
  judge_rect_intersect,
  format_bbox,
  format_points,
  re_format_points,
  pointsToBbox,
  d3XToCadX,
  d3YToCadY,
  binarySearch,
  toDecimal,
  clean,
  judge_bbox_direction,
  format_direction,
  reformat_direction,
  regionToPolygon,
  sort_points,
  format_polygon_points,
  re_format_polygon_points,
  re_format_polygon_bbox,
  polygonPointsToBbox,
} from '../v2/project.utils';
import { get_id, get_class } from '../../config/id.config';
import {
  svgContextmenuEvent,
  svgClickEvent,
  svgDbclickEvent,
} from './graph.event';
import { addAssistPoints, addAssistLines } from './item.event';
import store from '../../models/store/index';
import Adsorb from './adsorb';

const PATHLIST = store.getters.GetConnectionItemIdList;

class PolygonGraph extends NewNodeGraph {
  constructor(config) {
    // config
    // vue: that,
    let that = config.vue;
    config.ratio = that.ratio;
    config.title = 'new-node';
    config.id = that.new_node.id ? that.new_node.id : '';
    config.class = '';
    super(config);
    this.data_id = config.data_id;
    this.type = config.type; // new add
    this.mode = config.mode;
    this.node = null;
    this.vue = that;
    this.points = config.points;
    this.bbox = config.bbox;
    this.id = config.element_id;
    this.data_id = config.data_id;
  }

  init() {
    let mode = this.mode;
    let data_id = this.data_id;
    let new_id = get_id(mode.toUpperCase(), data_id)['newnode_mode_id'];
    this.id = new_id;
    let room_id = '';
    if (this.type === 'new') {
      room_id = this.vue.navigations[this.vue.svg.active].room;
    }
    let node = d3
      .select(`#${get_id(mode.toUpperCase())['newnode_item_g']}`)
      .append('polygon') //添加一个矩形
      .attr(
        'class',
        `${get_class(mode)['cad_draw_polygon']} ${
          get_class()['newnode']
        } ${room_id}`
      )
      .attr('id', new_id)
      .attr(`${mode}_id`, data_id)
      .attr('type', mode)
      .attr('room_id', room_id)
      .attr('shape', 'polygon')
      .attr('stroke', color_config()[mode])
      .attr('stroke-width', '2px')
      .attr('fill-opacity', 0)
      // svg等非输入性质的元素(与其对应的可输入性元素有input, textarea)， 是不可被聚焦的。 所以无法监听其的键盘事件。而通过增加 tabindex 属性，可以指定该元素可触焦。
      .attr('tabindex', -1); // svg元素

    this.node = node;

    return node;
  }

  add() {
    let mode = this.mode;
    let new_id = this.id;
    // console.log('new_id: ', new_id);
    let data_id = this.data_id;
    let node = d3
      .select(`#${get_id(mode.toUpperCase())['newnode_item_g']}`)
      .append('polygon') //添加一个矩形
      .attr(
        'class',
        `${get_class(mode)['cad_draw_polygon']} ${get_class()['newnode']}`
      )
      .attr('id', new_id)
      .attr(`${mode}_id`, data_id)
      .attr('type', mode)
      .attr('shape', 'polygon')
      .attr('stroke', color_config()[mode])
      .attr('stroke-width', '2px')
      .attr('fill-opacity', 0)
      .attr('points', re_format_polygon_points(this.points))
      .attr('bbox', re_format_polygon_bbox(this.bbox))

      // svg等非输入性质的元素(与其对应的可输入性元素有input, textarea)， 是不可被聚焦的。 所以无法监听其的键盘事件。而通过增加 tabindex 属性，可以指定该元素可触焦。
      .attr('tabindex', -1); // svg元素

    this.node = node;
  }

  bindSomeEvent() {
    // console.log('bindSomeEvent: ');
    let _this = this;
    // 绑定双击事件
    this.bindEvent(this.node, svgDbclickEvent, this.vue, function() {
      console.log('svgDbclickEvent: ', _this.node);
      _this.showDelete(_this.vue, _this.mode, _this.id);
    });

    // 绑定右键事件
    this.bindEvent(this.node, svgContextmenuEvent, this.vue, function() {
      // 显示弹窗
      if (PATHLIST.includes(_this.mode)) {
        let data = _this.vue[`${_this.mode}s`].find((item) => {
          return item.element_id === _this.id;
        });
        _this.vue.temp_path_info = data;
        _this.vue.show_edit_path = true;
      } else {
        _this.showDelete(_this.vue, _this.mode, _this.id);
      }
    });

    // 绑定左键事件
    this.bindEvent(this.node, svgClickEvent, this.vue, function() {
      console.log('keydown node: ', _this.node);
      _this.node.on('keydown', function() {
        var e = d3.event;
        console.log('e.keyCode: ', e.keyCode);
        const BACKSPACE = 8;
        const DELETE = 46;
        if (e.keyCode === DELETE || e.keyCode === BACKSPACE) {
          _this.showDelete(_this.vue, _this.mode, _this.id);
        }
      });

      d3.select(`#${get_id()['assist_g']}`).remove();
      // addAssistPoints(_this.id, _this.vue);
      d3.select(`#${_this.id}`).classed(get_class()['has_assist'], true);
      let has_assist;

      // if (d3.select(`#${get_id()['temp_text']}`).size() === 0) {
      //   path_g
      //     .append('text')
      //     .text('')
      //     .attr('id', get_id()['temp_text'])
      //     .attr('text-anchor', 'start')
      //     .style('font-size', '20px')
      //     .attr('dy', 8);
      // }

      // 添加tools 浮窗
      let origin_node = d3
        .select(`#${_this.id}`)
        .node()
        .getBBox();
      let tools = new ToolsGraph({
        vue: _this.vue,
        x: origin_node.x + origin_node.width,
        y: origin_node.y,
        iconList: ['icon_reset', 'icon_delete'],
        funcList: [
          function() {
            // reset
            console.log('icon_reset');
            let origin_points = d3.select(`#${_this.id}`).attr('origin_points');
            let origin_bbox = d3.select(`#${_this.id}`).attr('origin_bbox');
            if (!origin_points || !origin_bbox) {
              return;
            }
            // 记住开始的位置
            d3.select(`#${_this.id}`)
              .attr('points', origin_points)
              .attr('bbox', origin_bbox);

            // 将节点更新保存
            _this.vue.updateNewNode(_this.id);
            d3.select(`#${get_id()['assist_g']}`).remove();
            d3.select(`#${get_id()['assist_line_g']}`).remove();
            // addAssistPoints(_this.id, _this.vue);
            // 拖拽结束后重新生成tools
            tools.redraw(
              node.node().getBBox().x + node.node().getBBox().width,
              node.node().getBBox().y
            );

            // d3.select(`#${get_id()['temp_text']}`)
            //   .text(d3.select(`#${_this.id}`).attr('size'))
            //   .attr('stroke', color_config()[_this.mode])
            //   .attr('fill', color_config()[_this.mode])
            //   .attr('x', node.node().getBBox().x)
            //   .attr('y', node.node().getBBox().y - 15);
          },
          function() {
            // delete
            console.log('icon_delete');
            _this.showDelete(_this.vue, _this.mode, _this.id);
          },
        ],
      });
      tools.draw();

      // 添加吸附组件
      _this.adsorb = new Adsorb({
        vue: _this.vue,
        isExcluded: false,
        mode: 'mark',
        type: 'translate',
      });

      //TODO 定制化
      let param = {};
      // let type_id = store.getters.getGraphTypeById(_this.mode);
      // switch (type_id) {
      //   case store.getters.getObstaclesType:
      //     param = {
      //       type: 'obstacle',
      //       data: regionToPolygon(
      //         format_bbox(d3.select(`#${_this.id}`).attr('bbox'))
      //       ),
      //     };
      //     break;
      //   case store.getters.getConnectionItemType:
      //     param = {
      //       type: 'moving_path',
      //       data: {
      //         box: format_bbox(d3.select(`#${_this.id}`).attr('bbox')),
      //         direction: format_direction(
      //           d3.select(`#${_this.id}`).attr('direction'),
      //           'arr'
      //         ),
      //       },
      //     };
      //     break;
      //   case store.getters.getRegionType:
      //     param = {
      //       type: 'region',
      //       data: format_bbox(d3.select(`#${_this.id}`).attr('bbox')),
      //     };
      //     break;
      //   default:
      //     break;
      // }
      // let InfoRes = _this.vue.$model.project.postSomeInfo(param);
      // InfoRes.then((resp) => {
      //   console.log('resp: ', resp);
      //   _this.vue.outputInfo = resp.data.data;
      // });

      // d3.select(`#${get_id()['temp_text']}`)
      //   .text(d3.select(`#${_this.id}`).attr('size'))
      //   .attr('stroke', color_config()[_this.mode])
      //   .attr('fill', color_config()[_this.mode])
      //   .attr('x', node.node().getBBox().x)
      //   .attr('y', node.node().getBBox().y - 15);

      // 绑定拖拽事件
      let start_x = 0;
      let start_y = 0;

      _this.node.call(
        d3
          .drag()
          .on('start', function() {
            console.log('start: ', _this.id);
            d3.select(`#${get_id()['assist_g']}`).remove();
            has_assist = d3
              .select(`#${_this.id}`)
              .classed(get_class()['has_assist']);
            if (!has_assist) return;
            // d3.select(`#${get_id()['temp_text']}`).text('');

            tools.destroy();

            let points = format_points(
              d3.select(`#${_this.id}`).attr('points')
            );

            // 画水平垂直辅助线
            // addAssistLines(path_g, this.getBBox(), color_config()[_this.mode]);

            // 吸附开始
            // _this.adsorb.drag_start(_this.id, d3.event);
            start_x = d3.event.x;
            start_y = d3.event.y;
            // 记住开始的位置
            // d3.select(`#${_this.id}`)
            //   .attr('origin_points', re_format_points(points))
            //   .attr('origin_bbox', pointsToBbox(points, _this.vue));
          })
          .on('drag', function() {
            if (!has_assist) return;

            let point = d3.event;
            let points = format_polygon_points(
              d3.select(`#${_this.id}`).attr('points')
            );
            console.log('get points: ', points);

            // let adsorb = _this.adsorb.drag(point, points, 0, 0);
            // if (adsorb) {
            //   points = sort_points(adsorb);
            // }

            // TODO 拖拽未完成
            let remove_x = toDecimal(point.x - start_x);
            console.log('remove_x: ', remove_x);
            let remove_y = toDecimal(point.y - start_y);
            console.log('remove_y: ', remove_y);
            let result = [];
            console.log('points: ', points);
            points.forEach((item) => {
              result.push([
                toDecimal(item[0]) + remove_x,
                toDecimal(item[1]) + remove_y,
              ]);
            });
            console.log('result: ', result);
            d3.select(`#${_this.id}`)
              .attr('points', re_format_polygon_points(result))
              .attr('bbox', polygonPointsToBbox(result, _this.vue));

            start_x = point.x;
            start_y = point.y;
          })
          .on('end', function() {
            if (!has_assist) return;

            // 将节点更新保存
            _this.vue.updateNewNode(_this.id);
            d3.select(`#${get_id()['assist_g']}`).remove();
            d3.select(`#${get_id()['assist_line_g']}`).remove();
            // addAssistPoints(_this.id, _this.vue);
            // 拖拽结束后重新生成tools
            tools.redraw(
              _this.node.node().getBBox().x + _this.node.node().getBBox().width,
              _this.node.node().getBBox().y
            );

            // d3.select(`#${get_id()['temp_text']}`)
            //   .text(d3.select(`#${_this.id}`).attr('size'))
            //   .attr('stroke', color_config()[_this.mode])
            //   .attr('fill', color_config()[_this.mode])
            //   .attr('x', node.node().getBBox().x)
            //   .attr('y', node.node().getBBox().y - 15);
          })
      );
    });
  }
}

export { PolygonGraph };
