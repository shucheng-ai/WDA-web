/*
 * 动画模块状态管理
 */
import * as d3 from 'd3';

import Model from '../model/index';

import {
  get_model_bbox,
  toDecimal,
  re_format_bbox,
} from '../../components/v2/project.utils';
import { get_model } from '../../config/model.config';

const animationModules = {
  state: {
    show_edit_model: false,
    temp_model: {},
    models_count: 0,
    fixtures: [],
    direction_list: ['rightwards', 'downwards', 'leftwards', 'upwards'],
  },
  getters: {},
  mutations: {
    SET_TEMP_MODEL(state, data) {
      console.log('SET_TEMP_MODEL: ', data);
      let flag = false;
      if (data.update) {
        state.fixtures.forEach((fixture) => {
          if (fixture.id === data.id) {
            state.temp_model = JSON.parse(JSON.stringify(fixture));
            // state.temp_model = fixture;
            flag = true;
          }
        });
      }
      if (!flag) {
        // state.temp_model = data;
        state.temp_model = JSON.parse(JSON.stringify(data));
      }
    },
    UPDATE_MODEL_COUNT(state, data) {
      state.models_count = data;
    },
    UPDATE_FIXTURES_BY_TEMP(state) {
      // state.fixtures.forEach((fixture) => {
      //   if (fixture.id === state.temp_model.id) {
      //     fixture = JSON.parse(JSON.stringify(state.temp_model));
      //   }
      // });

      let index = state.fixtures.findIndex((fixture) => {
        return fixture.id === state.temp_model.id;
      });
      state.fixtures[index] = JSON.parse(JSON.stringify(state.temp_model));
    },
    SET_SHOW_EDIT_MODEL(state, flag) {
      state.show_edit_model = flag;
    },
    ADD_FIXTURES(state, data) {
      state.fixtures.push(JSON.parse(JSON.stringify(data)));
    },
    DELETE_FIXTURE(state, id) {
      state.fixtures = state.fixtures.filter((fixture) => {
        return fixture.id !== id;
      });
    },
    UPDATE_FIXTURES(state, data) {
      state.fixtures.forEach((fixture) => {
        if (fixture.id === data.id) {
          fixture.points = data.points;

          fixture.width = toDecimal(
            d3
              .select(`#${data.id}`)
              .node()
              .getBBox().width * data.ratio,
            0
          );
          fixture.height = toDecimal(
            d3
              .select(`#${data.id}`)
              .node()
              .getBBox().height * data.ratio,
            0
          );
        }
      });
    },
    UPDATE_FIXTURES_DIRECTION(state, data) {
      state.fixtures.forEach((fixture) => {
        if (fixture.id === data.id) {
          fixture.lastDirection = fixture.direction; // 保存上一次方向
          fixture.direction = data.direction;
          state.temp_model = JSON.parse(JSON.stringify(fixture)); // 更新temp_model
        }
      });
    },
  },
  // 异步驱动修改
  actions: {
    //post model info
    post_model_info({ commit, state, rootState, dispatch }, data) {
      const params = {
        project_id: rootState.project.project_id,
        fixtures: state.fixtures,
      };
      Model.project.postFixturesData(params).then((res) => {
        if (res.data.status === 1) {
          // this.$message.success('Add model success.');
          Model.project
            .getFixturesData(rootState.project.project_id)
            .then((resp) => {
              console.log('resp: ', resp);
            });
        } else {
          // this.$notification.error({
          //   message: 'Add model fail',
          //   description: 'Add model fail',
          // });
        }
      });
    },

    // 更新model位置信息
    update_model({ commit, rootState, dispatch }, id) {
      let points = get_model_bbox(id);
      commit('UPDATE_FIXTURES', {
        id,
        points,
        ratio: rootState.cad.ratio,
      });
      dispatch('post_model_info');
    },
    // 添加静态模型
    add_model({ commit, rootState, dispatch }, model) {
      model.bbox = re_format_bbox(rootState.cad.top_view_bbox);

      commit('ADD_FIXTURES', model);
      dispatch('post_model_info');
    },
    // 改变模型方向
    changeDirection({ commit, state, rootState, dispatch }, data) {
      let { direction, model } = data;
      console.log('model: ', model);
      // 获取源方向和现方向，比较在direction_list中的相差值，相差1为90度
      let origin = state.direction_list.findIndex((item) => {
        return item === model.originDirection;
      });
      let last = state.direction_list.findIndex((item) => {
        return item === model.lastDirection;
      });
      let current = state.direction_list.findIndex((item) => {
        return item === direction;
      });

      commit('UPDATE_FIXTURES_DIRECTION', {
        id: model.id,
        direction: direction,
      });

      let rotate = 90 * (current - last);
      let svg = d3.select(`#${model.id}>svg`);
      let viewBox = svg.attr('viewBox').split(' ');

      // 若旋转90或者270度，则需要将宽和高对调 还要校验上一次方向
      console.log('(current - last): ', current - last);
      if ((current - last) % 2 !== 0) {
        // 奇数

        // // 旋转中心为svg 内部元素坐标系中心点坐标 即viewBox的1/2
        // d3.select(`#${model.id}>svg>g`).attr(
        //   'transform',
        //   `rotate(${rotate} ${viewBox[3] / 2}, ${viewBox[2] / 2})`
        // );

        // let height = svg.attr('height');
        // let width = svg.attr('width');

        // svg
        //   .attr('height', width)
        //   .attr('width', height)
        //   .attr(
        //     'viewBox',
        //     `${viewBox[0]} ${viewBox[1]} ${viewBox[3]} ${viewBox[2]}`
        // );

        // 旋转90度时 更换svg图片
        let x = svg.attr('x');
        let y = svg.attr('y');
        let height = svg.attr('height');
        let width = svg.attr('width');

        svg.remove();

        d3.select(`#${model.id}`).html(
          get_model({
            x,
            y,
            width: height,
            height: width,
            direction: direction,
          })[model.model]
        );

        dispatch('update_model', model.id);

        if (!model.hasDirections.includes(direction)) {
          viewBox = d3
            .select(`#${model.id}>svg`)
            .attr('viewBox')
            .split(' ');
          // 旋转中心为svg 内部元素坐标系中心点坐标 即viewBox的1/2
          d3.select(`#${model.id}>svg>g`).attr(
            'transform',
            `rotate(180 ${viewBox[2] / 2}, ${viewBox[3] / 2})`
          );
        }
      } else {
        // 旋转中心为svg 内部元素坐标系中心点坐标 即viewBox的1/2
        let _rotate = model.hasDirections.includes(direction) ? 0 : rotate;
        d3.select(`#${model.id}>svg>g`).attr(
          'transform',
          `rotate(${_rotate} ${viewBox[2] / 2}, ${viewBox[3] / 2})`
        );
        dispatch('update_model', model.id);
      }
    },
  },
};

export default animationModules;
