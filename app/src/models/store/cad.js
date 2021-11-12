const CadStore = {
  state: {
    project_id: -1,
    hash: null,
    is_exist: 0,
    data: {},
    is_zooming: false, // 是否正在缩放，正在缩放时禁止拖拽
    top_view_bbox: [],
    ratio: 0,
    is_polygon_closed: 'new', // new 新建 closed 闭合 open 打开
    is_line_closed: 'new', // new 新建 closed 闭合 open 打开
    edit_polygon_id: '',
    edit_line_id: '',
    line_count: 0, // line数量
    has_cad_data_ever: false, // 是否拥有错误的cad信息
  },
  mutations: {
    ADD_LINE_COUNT(state, data = 1) {
      state.line_count += data;
    },
    SET_CAD_DATA(state, data) {
      state.data = data;
      console.log('SET_CAD_DATA data: ', data);
      if (data.cad_name) {
        state.has_cad_data_ever = true;
      }
    },
    UPDATE_IS_ZOOMING(state, flag) {
      state.is_zooming = flag;
    },
    SET_TOP_VIEW_BBOX(state, data) {
      state.top_view_bbox = data;
    },
    SET_RATIO(state, ratio) {
      state.ratio = ratio;
    },
    SET_IS_POLYGON_CLOSED(state, data) {
      state.is_polygon_closed = data;
    },
    SET_EDIT_POLYGON_ID(state, data) {
      state.edit_polygon_id = data;
    },
    SET_IS_LINE_CLOSED(state, data) {
      state.is_line_closed = data;
    },
    SET_EDIT_LINE_ID(state, data) {
      state.edit_line_id = data;
    },
  },
};

export default CadStore;
