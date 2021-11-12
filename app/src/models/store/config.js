import * as d3 from 'd3';
import { get_id, get_class } from '../../config/id.config';

const OBSTACLES = 'obstacles';
const CONNECTION_ITEM = 'connection_item';
const REGION = 'region';
const POLYGON = 'polygon';

const ConfigStore = {
  state: {
    table_width: 460,
    graph_width: 800,
    graph_height: 800,
    project_sort: 'update_date',
    project_limit: 10,
    project_reverse: true,

    graph_operations: [
      {
        id: OBSTACLES,
        name: 'obstacles',
        origin_name: 'obstacles',
        show: true,
        data: [
          {
            id: 'obstacle',
            name: 'obstacle',
            show: true,
            default_shape: 'region',
            allow_shapes: ['region', 'polygon', 'normal'],
          },
          {
            id: 'guard',
            name: 'guard',
            show: true,
            default_shape: 'region',
            allow_shapes: ['region', 'polygon', 'normal'],
          },
          // {
          //   id: 'isolate',
          //   name: 'isolate',
          //   show: true,
          //   default_shape: 'region',
          //   allow_shapes: ['region', 'polygon'],
          // },
          {
            id: 'evitable',
            name: 'evitable',
            show: true,
            default_shape: 'region',
            allow_shapes: ['region', 'polygon', 'normal'],
          },
        ],
      },
      {
        id: CONNECTION_ITEM,
        name: 'moving_paths',
        origin_name: 'moving_paths',
        show: true,
        data: [
          {
            id: 'path',
            name: 'path',
            show: true,
            default_shape: 'region',
            allow_shapes: ['region', 'normal'],
          },
          {
            id: 'block',
            name: 'block',
            show: true,
            default_shape: 'region',
            allow_shapes: ['region', 'normal'],
          },
        ],
      },
      {
        id: REGION,
        name: 'region',
        origin_name: 'region',
        show: true,
        data: {
          id: 'region',
          name: 'region',
          show: true,
          default_shape: 'region',
          allow_shapes: ['region', 'normal', 'polygon'],
        },
      },
      // {
      //   id: POLYGON,
      //   name: 'polygon',
      //   origin_name: 'polygon',
      //   show: true,
      //   data: { id: 'polygon', name: 'polygon', show: true },
      // },
    ],
  },
  getters: {
    graph_operations_list(state) {
      let result = [];
      state.graph_operations.forEach((graph) => {
        if (Array.isArray(graph.data)) {
          graph.data.forEach((item) => {
            result.push(item);
          });
        } else {
          result.push(graph.data);
        }
      });
      return result;
    },

    graphOperationsListByGroupId: (state) => (list) => {
      let result = [];
      state.graph_operations.forEach((graph) => {
        if (Array.isArray(graph.data) && list.includes(graph.id)) {
          graph.data.forEach((item) => {
            result.push(item);
          });
        } else if (list.includes(graph.id)) {
          result.push(graph.data);
        }
      });
      return result;
    },

    getGraphTypeById: (state) => (id) => {
      let result = state.graph_operations.find((graph) => {
        if (Array.isArray(graph.data)) {
          return graph.data.some((item) => {
            return item.id === id;
          });
        } else {
          return graph.data.id === id;
        }
      });
      return result && result.id ? result.id : null;
    },

    getSomeGraphAttr: (state, getters) => (id, attr) => {
      let result = getters.graph_operations_list.find((graph) => {
        return graph.id === id;
      });
      return result && result[attr] ? result[attr] : [];
    },

    GetConnectionItemIdList: (state) => {
      let result = [];
      let c_i = state.graph_operations.find((graph) => {
        return graph.id === CONNECTION_ITEM;
      });
      c_i.data.forEach((item) => {
        result.push(item.id);
      });
      return result;
    },

    getObstaclesType() {
      return OBSTACLES;
    },
    getConnectionItemType() {
      return CONNECTION_ITEM;
    },
    getRegionType() {
      return REGION;
    },
  },
  mutations: {
    initConfig(state) {
      // graph_width =  window.innerWidth - right_table - padding*2 - margin
      let graph_width = window.innerWidth - 460 - 20 - 20 - 10;
      // graph_height =  window.innerHeight - header - step - margin - bottom
      let graph_height = window.innerHeight - 42 - 44 - 5 - 35;
      graph_height = graph_height > 400 ? graph_height : 400;
      state.graph_width = graph_width;
      state.graph_height = graph_height;
    },

    SET_GRAPH_OPERATIONS_TYPE_NAME(state, data) {
      let type = data.type;
      let name = data.name;

      state.graph_operations.forEach((graph) => {
        if (graph.id === type) {
          if (name === 'origin_name') {
            graph.name = graph.origin_name;
          } else {
            graph.name = name;
          }
        }
      });
    },

    SET_GRAPH_OPERATIONS_TYPE_SHOW(state, data) {
      let { id, type, group_type, flag } = data;
      console.log('SET_GRAPH_OPERATIONS_TYPE_SHOW: ', data);

      state.graph_operations.forEach((graph) => {
        if (Array.isArray(graph.data)) {
          if (type === 'group' && graph.id === group_type) {
            graph.show = flag;
            d3.select(
              `#${get_id(graph.id.toUpperCase())['newnode_group_g']}`
            ).classed('hide-node', !flag);
            console.log('group.id', graph.id, flag);
          }
          if (graph.id === group_type) {
            graph.data.forEach((item) => {
              if (type === 'group' || item.id === id) {
                d3.select(
                  `#${get_id(item.id.toUpperCase())['newnode_item_g']}`
                ).classed('hide-node', !flag);
                console.log('item.id', item.id, flag);
                item.show = flag;
              }
            });
            // 如果子的属性改变了 则会影响组的属性
            if (type === 'item') {
              let isAllEqualFlag = !graph.data.some(function(item, index) {
                return item.show !== graph.data[0].show;
              });
              // 只有 相同 且 graph.data[0].show 为false 组的才为false
              if (isAllEqualFlag && !graph.data[0].show) {
                graph.show = false;
              } else {
                graph.show = true;
              }
              // graph.show = isAllEqualFlag ? graph.data[0].show : !graph.show;
              console.log('isAllEqualFlag: ', isAllEqualFlag);
              d3.select(
                `#${get_id(graph.id.toUpperCase())['newnode_group_g']}`
              ).classed('hide-node', !graph.show);
            }
          }
        } else {
          if (graph.id === id) {
            console.log('ungroup.id', graph.id, flag);
            d3.select(
              `#${get_id(graph.id.toUpperCase())['newnode_group_g']}`
            ).classed('hide-node', !flag);
            graph.show = flag;
          }
        }
      });
    },

    SET_GRAPH_OPERATIONS_ALL_SHOW(state, data) {
      let { flag } = data;
      state.graph_operations.forEach((graph) => {
        if (Array.isArray(graph.data)) {
          graph.show = flag;
          graph.data.forEach((item) => {
            item.show = flag;
          });
        } else {
          graph.show = flag;
        }
      });
    },
  },
};

export default ConfigStore;
