const defaultPackage = (simplified_mode = false) => {
  return {
    width: null,
    height: null,
    depth: null,
    quantity: null,
    skus: simplified_mode ? -1 : null,
    stack_limit: simplified_mode ? 5 : 1,
    packaging: null,
    bins_per_unit: null,
    storage: null,
    room: -1,
  };
};

const defaultRooms = (rooms_length) => {
  let data = {
    room_default: {
      ceiling_height: 10000,
      direction: 0,
      outbound_side: 0,
      outbound_space: 20,
      inbound_side: 2,
      inbound_space: 0,
    },
    rooms: [],
  };
  if (rooms_length) {
    for (let i = 0; i < rooms_length; i++) {
      data.rooms.push({
        ceiling_height: null,
        direction: null,
        inbound_side: null,
        inbound_space: null,
        outbound_side: null,
        outbound_space: null,
      });
    }
  }
  return data;
};

// const defaultStocks = (simplified_mode = false) => {
//   return [
//     {
//       width: 1000,
//       height: 1400,
//       depth: 1200,
//       quantity: 400,
//       skus: simplified_mode ? -1 : 300,
//       stack_limit: simplified_mode ? 5 : 1,
//       packaging: 1,
//       bins_per_unit: 3,
//       storage: 1,
//       room: -1
//     },
//     {
//       width: 1000,
//       height: 1200,
//       depth: 1200,
//       quantity: 300,
//       skus: simplified_mode ? -1 : 300,
//       stack_limit: simplified_mode ? 5 : 1,
//       packaging: 1,
//       bins_per_unit: 3,
//       storage: 2,
//       room: -1
//     }
//     // defaultPackage()
//   ];
// };

const defaultParams = () => {
  let data = {};
  data['thumbnail_size'] = 256;
  let room_data = defaultRooms();
  data['room_default'] = room_data.room_default;
  data['rooms'] = room_data.rooms;
  return data;
};

const defaultProject = () => {
  return {
    id: -1,
    choose_index: 0,
    name: '',
    version: '',
    snapshot_link: '',
    files: {},
    index_url: '', // 简化版 landing page所用
    contact_url: '', // 简化版 所用
    simplified_mode: false, // 是否简化版，简化版会去掉部分功能
    png_mode: false, // 是否开启svg to png模式，提升拖拽性能
    hasGenerateCad: false, // 每次重新calculate后，都需要把hasGenerateCad置为false
    disabledGenerateCad: true, // 新建项目时为true；calc时为true，只有calc成功后才为false
    // hasGenerate3D: false, // 每次重新calculate后，都需要把hasGenerate3D置为false
    input: {
      stocks: [],
      params: defaultParams(),
      stocks_new: [],
    },
    showrooms: false,
    output: [],
    thumbnail_list: [],
    project_thumbnail_list: [],
    api: {
      version: '2019-11-18',
      list: ['2019-11-18'],
    },
    region: {
      choose_index: 0,
      type: '', // storage generic
      derived: {
        master: {},
      },
      parameters: {
        master: {},
      },
      storage: {},
    },
    cad: {
      id: 0,
      upload_url: '/api/upload/cad',
      upload_info: {},
      download_url: '',
      list: [],
      name: '',
      namelist: ['dxf', 'dwg'],
      // namelist: ['dxf'],
      is_upload: false,
      hashname: '',
      choose_id: 0,
      upload_message: '',
      driver: {},
      steps: {
        status: false,
        compress: '', // wait process finish
        upload: '',
        analyze: '',
        finish: '',
      },
      room: null,
      rooms: [],
      active_navigation: 0,
      navigation: [],
      classes: [],
      layers: [],
      annotations: [],
      annotation_types: {
        MARK_FUNCTION: [
          'GUARD_OBSTACLE',
          'HINT_DOCK',
          'HINT_DOCK_IN',
          'HINT_DOCK_OUT',
        ],
        CAD_ELEMENT: ['CAD_ADD', 'CAD_REMOVE'],
      },
      svg: {
        ratio: 60,
        canDrag: true,
        show_mask_modal: false,
        edit_mask_modal: false,
        tempSelector: {},
        temp: {
          bbox: [],
          layer: '',
          type: null,
        },
        padding: {
          x: 20,
          y: 20,
        },
        remove: {
          x: 0,
          y: 0,
        },
        zoom: {
          ratio: 1,
        },
      },
    },
    svg: {
      width: 1000,
      height: 1000,
      base_svg_id: null,
      canDrag: true,
      ratio: 60,
      side_front_ratio: 30,
      padding: {
        x: 20,
        y: 20,
      },
      remove: {
        x: 0,
        y: 0,
      },
      drag: {
        start_x: 0,
        start_y: 0,
      },
      zoom: {
        r: 1,
      },
    },
    png: {
      obj: {},
      remove: {
        x: 0,
        y: 0,
      },
      drag: {
        start_x: 0,
        start_y: 0,
      },
    },
  };
};

export { defaultParams, defaultPackage, defaultProject, defaultRooms };
