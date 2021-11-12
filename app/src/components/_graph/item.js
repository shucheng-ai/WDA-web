/*
 * 添加新元素 region paht obstacle
 *
 **/
import BaseGraph from './base';
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
const GRAPH_OPERATIONS_LIST = store.getters.graph_operations_list;

class NewNodeGraph extends BaseGraph {
  constructor(config) {
    // config
    // vue: that,
    // x: d3.event.x,
    // y: d3.event.y
    let that = config.vue;
    config.ratio = that.ratio;
    config.title = 'new-node';
    config.id = that.new_node.id ? that.new_node.id : '';
    config.class = '';
    super(null, config);
    this.x = config.x;
    this.y = config.y;
    this.data = config.data;
    this.type = config.type;
    // this.mode = '';
    this.vue = that;
  }

  draw(pre_mode = '', pre_id = '') {
    let g = this.vue.svg.g;
    let path_g = this.vue.svg.path_g;
    let mode = this.vue.svg.mode.split('-');
    mode = mode[mode.length - 1];
    let data_id = create_random();

    if (pre_mode) {
      mode = pre_mode;
      data_id = pre_id;
    } else {
      this.vue[`${mode}s_count`] += 1;
      data_id = this.vue[`${mode}s_count`];
    }
    // this.mode = mode;

    let new_id = get_id(mode.toUpperCase(), data_id)['newnode_mode_id'];
    this.id = new_id;

    let room_id = '';
    if (this.type === 'new') {
      room_id = this.vue.navigations[this.vue.svg.active].room;
    } else {
      room_id = this.data.room_id;
    }
    // path_g.raise();
    // let node = path_g
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
      .attr('room_id', room_id)
      .attr('shape', 'region')
      .attr(`${mode}_id`, data_id)
      .attr('type', mode)
      .attr('stroke', color_config()[mode])
      .attr('stroke-width', '2px')
      .attr('fill-opacity', 0)
      // svg等非输入性质的元素(与其对应的可输入性元素有input, textarea)， 是不可被聚焦的。 所以无法监听其的键盘事件。而通过增加 tabindex 属性，可以指定该元素可触焦。
      .attr('tabindex', -1); // svg元素

    this.vue.new_node.id = new_id;
    this.vue.new_node.type = mode;
    this.vue.new_node.node = node;
    this.vue.new_node.data = {
      x: this.x,
      y: this.y,
      id: data_id,
    };
    let that = this.vue;
    let _this = this;

    if (this.type === 'new') {
      // 添加测距
      path_g
        .append('text')
        .text('')
        .attr('id', get_id()['temp_text'])
        .attr('fill', color_config()[mode])
        .attr('x', this.x)
        .attr('y', this.y - 15)
        .attr('text-anchor', 'start')
        .style('font-size', '20px')
        .attr('dy', 8);
    }

    // 绑定双击事件
    this.bindEvent(node, svgDbclickEvent, this.vue, function() {
      _this.showDelete(that, mode, new_id);
    });

    // 绑定左键事件
    this.bindEvent(node, svgClickEvent, this.vue, function() {
      // 如果不是在移动模式下 无法点击选中item
      if (_this.vue.svg.shape !== 'normal') {
        console.log('error shape: ', _this.vue.svg.shape);
        return false;
      }
      console.log('keydown node: ', node);
      node.on('keydown', function() {
        var e = d3.event;
        console.log('e.keyCode: ', e.keyCode);
        const BACKSPACE = 8;
        const DELETE = 46;
        if (e.keyCode === DELETE || e.keyCode === BACKSPACE) {
          _this.showDelete(that, mode, new_id);
        }
      });

      d3.select(`#${get_id()['assist_g']}`).remove();
      addAssistPoints(new_id, that);
      d3.select(`#${new_id}`).classed(get_class()['has_assist'], true);

      if (d3.select(`#${get_id()['temp_text']}`).size() === 0) {
        path_g
          .append('text')
          .text('')
          .attr('id', get_id()['temp_text'])
          // .attr('fill', color_config()[mode])
          .attr('text-anchor', 'start')
          .style('font-size', '20px')
          .attr('dy', 8);
      }

      // 添加tools 浮窗
      let origin_node = d3
        .select(`#${new_id}`)
        .node()
        .getBBox();
      let tools = new ToolsGraph({
        vue: that,
        x: origin_node.x + origin_node.width,
        y: origin_node.y,
        iconList: ['icon_reset', 'icon_delete'],
        funcList: [
          function() {
            // reset
            console.log('icon_reset');
            let origin_points = d3.select(`#${new_id}`).attr('origin_points');
            let origin_bbox = d3.select(`#${new_id}`).attr('origin_bbox');
            if (!origin_points || !origin_bbox) {
              return;
            }
            // 记住开始的位置
            d3.select(`#${new_id}`)
              .attr('points', origin_points)
              .attr('bbox', origin_bbox);

            // let n = d3.select(`#${new_id}`).node().getBBox();
            // 将节点更新保存
            t.vue.updateNewNode(t.id);
            d3.select(`#${get_id()['assist_g']}`).remove();
            d3.select(`#${get_id()['assist_line_g']}`).remove();
            addAssistPoints(t.id, t.vue);
            // 拖拽结束后重新生成tools
            tools.redraw(
              node.node().getBBox().x + node.node().getBBox().width,
              node.node().getBBox().y
            );

            d3.select(`#${get_id()['temp_text']}`)
              .text(d3.select(`#${t.id}`).attr('size'))
              .attr('stroke', color_config()[mode])
              .attr('fill', color_config()[mode])
              .attr('x', node.node().getBBox().x)
              .attr('y', node.node().getBBox().y - 15);
          },
          function() {
            // delete
            console.log('icon_delete');
            _this.showDelete(that, mode, new_id);
          },
        ],
      });
      tools.draw();

      // 添加吸附组件
      t.adsorb = new Adsorb({
        vue: that,
        isExcluded: false,
        mode: 'mark',
        type: 'translate',
      });

      // let start_x = 0;
      // let start_y = 0;
      // let adsorb_x = false;
      // let adsorb_y = false;
      // const SPACE = 5;
      // const TYPE_ARR = ['wall']; // 一直判断吸附的元素
      // let x_list = new Set();
      // let y_list = new Set();
      // let xy_list = [];
      // let width = 0;
      // let height = 0;

      //TODO 定制化
      let param = {};
      let type_id = store.getters.getGraphTypeById(mode);
      switch (type_id) {
        case store.getters.getObstaclesType:
          param = {
            type: 'obstacle',
            data: regionToPolygon(
              format_bbox(d3.select(`#${new_id}`).attr('bbox'))
            ),
          };
          break;
        case store.getters.getConnectionItemType:
          param = {
            type: 'moving_path',
            data: {
              box: format_bbox(d3.select(`#${new_id}`).attr('bbox')),
              direction: format_direction(
                d3.select(`#${new_id}`).attr('direction'),
                'arr'
              ),
            },
          };
          break;
        case store.getters.getRegionType:
          param = {
            type: 'region',
            data: format_bbox(d3.select(`#${new_id}`).attr('bbox')),
          };
          break;
        default:
          break;
      }
      let InfoRes = that.$model.project.postSomeInfo(param);
      InfoRes.then((resp) => {
        console.log('resp: ', resp);
        that.outputInfo = resp.data.data;
      });

      d3.select(`#${get_id()['temp_text']}`)
        .text(d3.select(`#${t.id}`).attr('size'))
        .attr('stroke', color_config()[mode])
        .attr('fill', color_config()[mode])
        .attr('x', node.node().getBBox().x)
        .attr('y', node.node().getBBox().y - 15);

      // 绑定拖拽事件
      node.call(
        d3
          .drag()
          .on('start', function() {
            console.log('start: ', t.id);
            d3.select(`#${get_id()['assist_g']}`).remove();
            has_assist = d3
              .select(`#${new_id}`)
              .classed(get_class()['has_assist']);
            if (!has_assist) return;
            d3.select(`#${get_id()['temp_text']}`).text('');

            tools.destroy();

            let points = format_points(d3.select(`#${t.id}`).attr('points'));

            // 画水平垂直辅助线
            addAssistLines(path_g, this.getBBox(), color_config()[mode]);

            // 吸附开始
            t.adsorb.drag_start(t.id, d3.event);

            // 记住开始的位置
            d3.select(`#${new_id}`)
              .attr('origin_points', re_format_points(points))
              .attr('origin_bbox', pointsToBbox(points, that));
          })
          .on('drag', function() {
            if (!has_assist) return;

            let point = d3.event;
            let points = format_points(d3.select(`#${t.id}`).attr('points'));
            let adsorb = t.adsorb.drag(point, points, 0, 0);
            if (adsorb) {
              points = sort_points(adsorb);
            }
          })
          .on('end', function() {
            if (!has_assist) return;

            // 将节点更新保存
            t.vue.updateNewNode(t.id);
            d3.select(`#${get_id()['assist_g']}`).remove();
            d3.select(`#${get_id()['assist_line_g']}`).remove();
            addAssistPoints(t.id, t.vue);
            // 拖拽结束后重新生成tools
            tools.redraw(
              node.node().getBBox().x + node.node().getBBox().width,
              node.node().getBBox().y
            );

            d3.select(`#${get_id()['temp_text']}`)
              .text(d3.select(`#${t.id}`).attr('size'))
              .attr('stroke', color_config()[mode])
              .attr('fill', color_config()[mode])
              .attr('x', node.node().getBBox().x)
              .attr('y', node.node().getBBox().y - 15);
          })
      );
    });

    // 绑定拖拽事件
    let t = this;
    let has_assist = false;

    // 绑定右键事件
    this.bindEvent(node, svgContextmenuEvent, this.vue, function() {
      // 显示弹窗
      let data = that[`${mode}s`].find((item) => {
        return item.element_id === new_id;
      });
      that.temp_path_info = data;

      that.show_edit_path = true;
      if (PATHLIST.includes(mode)) {
        that.temp_path_info.hasDirection = true;
      }

      // if (PATHLIST.includes(mode)) {
      //   let data = that[`${mode}s`].find((item) => {
      //     return item.element_id === new_id;
      //   });
      //   that.temp_path_info = data;
      //   that.show_edit_path = true;
      // } else {
      //   _this.showDelete(that, mode, new_id);
      // }
    });
  }

  showDelete(that, mode, new_id) {
    that.$confirm({
      title: `Are you sure delete this ${mode}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        console.log('OK');
        d3.select(`#${new_id}`).remove();
        d3.select(`#${get_id()['assist_g']}`).remove();
        clean();
        // 从数据中删除
        that[`${mode}s`] = that[`${mode}s`].filter((item) => {
          return item.element_id !== new_id;
        });

        let type_id = store.getters.getGraphTypeById(mode);

        if (type_id === store.getters.getObstaclesType) {
          // "obstacles"
          that.updateObstaclesInfo();
        } else if (type_id === store.getters.getConnectionItemType) {
          // "moving_paths"
          that.updateMovingPathInfo();
        }
        console.log('new_id: ', new_id);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  drag(data) {
    let g = this.vue.svg.g;
    let [x, y, event_x, event_y] = [
      toDecimal(this.vue.new_node.data.x),
      toDecimal(this.vue.new_node.data.y),
      toDecimal(data.x),
      toDecimal(data.y),
    ];
    // bbox 需要排序
    let bbox = pointsToBbox(
      [
        [x, y],
        [event_x, event_y],
      ],
      this.vue
    );
    // let bbox = `${d3XToCadX(x, this.vue)} ${d3YToCadY(y, this.vue)} ${d3XToCadX(
    //   event_x,
    //   this.vue
    // )} ${d3YToCadY(event_y, this.vue)}`;
    this.vue.new_node.data.x1 = data.x;
    this.vue.new_node.data.y1 = data.y;
    let points = `${x},${y} ${event_x},${y} ${event_x},${event_y} ${x},${event_y} `;

    let node = d3
      .select(`#${this.id}`)
      .attr('points', points)
      .attr('bbox', bbox)
      .node()
      .getBBox();

    // size由bbox决定
    let _bbox = bbox.split(' ');
    let size_x = toDecimal(Math.abs(_bbox[2] - _bbox[0]), 0);
    let size_y = toDecimal(Math.abs(_bbox[3] - _bbox[1]), 0);

    // let size_x = toDecimal(
    //   Math.abs(d3XToCadX(x, this.vue) - d3XToCadX(event_x, this.vue)),
    //   0
    // );
    // let size_y = toDecimal(
    //   Math.abs(d3YToCadY(y, this.vue) - d3YToCadY(event_y, this.vue)),
    //   0
    // );

    this.size_x = size_x;
    this.size_y = size_y;
    let mode = d3.select(`#${this.id}`).attr('type');

    d3.select(`#${get_id()['temp_text']}`)
      .text(`${size_x} * ${size_y}`)
      .attr('fill', color_config()[mode])
      .attr('stroke', color_config()[mode])
      .attr('x', node.x)
      .attr('y', node.y - 15);
  }

  // type new 当前新画的     add 绘制已有的数据
  end(type = 'new') {
    let direction;

    if (type === 'add') {
      d3.select(`#${this.id}`).attr('size', `${this.size_x} * ${this.size_y}`);
      if (PATHLIST.includes(this.vue.new_node.type)) {
        direction = reformat_direction(this.data.info._direction);
      }
    } else {
      d3.select(`#${this.id}`).attr(
        'size',
        d3.select(`#${get_id()['temp_text']}`).text()
      );

      // 判断 当前操作是否在选中区间内
      let new_node = d3.select(`#${this.id}`).node();
      let active_rect_node = d3.select(`#${get_id()['active_bbox']}`).node();
      let result = judge_rect_intersect(
        new_node.getBBox(),
        active_rect_node.getBBox()
      );

      direction = judge_bbox_direction(
        format_bbox(d3.select(`#${this.id}`).attr('bbox'))
      );

      console.log('result: ', result);
      if (result) {
        // vue add (obstacle, path, region)
        this.vue.new_node.data.bbox = format_bbox(
          d3.select(`#${this.id}`).attr('bbox')
        );
        this.vue.new_node.points = format_points(
          d3.select(`#${this.id}`).attr('points')
        );

        this.vue.new_node.data.direction = judge_bbox_direction(
          format_bbox(d3.select(`#${this.id}`).attr('bbox'))
        );
        this.vue.new_node.data._direction = format_direction(
          judge_bbox_direction(
            format_bbox(d3.select(`#${this.id}`).attr('bbox'))
          ),
          'arr'
        );

        this.vue.addNewNode();
      } else {
        // clean this node
        this.vue.$message.warning(
          'The operation should be in the current room'
        );
        d3.select(`#${this.id}`).remove();
        d3.select(`#${get_id()['temp_text']}`).remove();
      }
    }

    // 判断类型
    if (PATHLIST.includes(this.vue.new_node.type)) {
      let _direction = format_direction(direction, 'direction');
      //marker-start="url(#arrow)" marker-mid="url(#arrow)"
      d3.select(`#${this.id}`)
        .attr('direction', direction)
        .attr(
          'marker-start',
          `url(#${
            get_id(_direction, this.vue.new_node.type.toUpperCase())['arrow']
          })`
        )
        .attr(
          'marker-mid',
          `url(#${
            get_id(_direction, this.vue.new_node.type.toUpperCase())['arrow']
          })`
        );
    }

    // clean new node
    this.vue.new_node = {
      id: null,
      type: null,
      points: null,
      node: null,
      data: null,
    };
    this.vue.svg.mode = 'normal';
    this.vue.svg.shape = 'normal';

    d3.select(`#${get_id()['temp_text']}`).text('');
  }
}

export { NewNodeGraph };
