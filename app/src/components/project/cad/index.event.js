import { addSVG } from '../../../components/sc-graph/svg';
import { getRectInfo, addRect } from '../../../components/sc-graph/rect';
// import { addPolygon } from '../../../components/sc-graph/polygon';
import { addGroup } from '../../../components/sc-graph/group';
import { addLine } from '../../../components/sc-graph/line';
import { cadDrag, move } from '../../../components/sc-graph/drag';
import { Png } from '../../../components/sc-graph/png';
import { yTrans } from '../../sc-graph/utils';

import * as d3 from 'd3';

// base svg id: cadSvg
function drawCadSvg(data, active, type = '', point = {}) {
  // console.log(data);

  let base_component = data.dxf_path[0].navigation[active];
  // if (active === -1) {
  //   data.navigation.forEach((item, index) => {
  //     if (item.display) {
  //       base_component = item;
  //       this.project.cad.active_navigation = index;
  //     }
  //   });
  // } else {
  //   base_component = data.navigation[active];
  // }

  const svg_config = {
    father: 'cadSvg',
    svg_id: 'BASE-CAD-SVG',
    svg_width: this.project.svg.width,
    svg_height: this.project.svg.height,
    svg_class: 'cad-base-svg',
  };
  // 添加底层svg
  let svg = addSVG.call(this, svg_config);
  console.log('svg: ', svg);
  let g = svg.append('g').attr('id', 'BASE-CAD-G');
  cadDrag(g, this, svg_config);

  let layers = data.dxf_path[0].top_view;
  draw.call(this, base_component.bbox, layers, g);

  // 初始化渲染生成img
  if (this.project.svg.png_mode) {
    this.$nextTick(() => {
      let config = {
        father: 'cadPng',
        png_id: 'BASE-CAD-PNG',
        png_width: this.project.svg.width,
        png_height: this.project.svg.height,
        png_class: 'sc-base-png',
      };
      if (this.project.png.obj.config) {
        // 不为空时需清除
        this.project.png.obj.removePng();
      }
      let svg_png = new Png(config, svg_config, this);
      this.project.png.obj = svg_png;
    });
  } else {
    if (type === 'drag') {
      let cadNode = d3
        // .select('#BASE-CAD-SVG>g')
        .select('#CAD-LAYOUT-BBOX-RECT-rect')
        .node()
        .getBBox();

      let move_x = cadNode.x - point.x;
      let move_y = cadNode.y - point.y;

      console.log('move_x: ', move_x);
      console.log('-move_y: ', -move_y);
      console.log(cadNode);
      this.project.cad.svg.remove.x = -move_x;
      this.project.cad.svg.remove.y = move_y;
      move(
        -move_x,
        -move_y,
        'cad-layer-bbox-g',
        ['cad-bbox-rect', 'cad-layer-bbox-rect'],
        ['cad-layer-line']
      );
    }
    this.show.main_loading = false;
  }
}

function draw(activeBbox, layers, g) {
  console.log('activeBbox: ', activeBbox);
  let baseinfo = getRectInfo([
    activeBbox[0][0],
    activeBbox[0][1],
    activeBbox[1][0],
    activeBbox[1][1],
  ]);
  console.log('baseinfo: ', baseinfo);
  let [[base_xmin, base_ymin], [base_xmax, base_ymax]] = activeBbox;

  let [padding_x, padding_y, padding_nav] = [
    this.project.cad.svg.padding.x,
    this.project.cad.svg.padding.y,
    d3.select('#graphMenu').node().offsetHeight,
  ];
  let [svg_width, svg_height] = [
    this.project.svg.width - padding_x * 2,
    this.project.svg.height - padding_y * 2 - padding_nav,
  ];
  let [ratio_x, ratio_y] = [
    baseinfo.width / svg_width,
    baseinfo.height / svg_height,
  ];

  let ratio = ratio_x > ratio_y ? ratio_x : ratio_y;
  ratio = ratio / this.project.cad.svg.zoom.ratio;
  this.project.cad.svg.ratio = ratio;
  let [remove_x, remove_y] = [
    this.project.cad.svg.remove.x / ratio,
    this.project.cad.svg.remove.y / ratio,
  ];

  let bg_bbox_config = {
    svg_father: g,
    svg_width: baseinfo.width / ratio,
    svg_height: baseinfo.height / ratio,
    svg_id: 'CAD-LAYOUT-BBOX-RECT',
    svg_class: 'cad-bbox-rect bg-dark',
    svg_x: padding_x + remove_x,
    svg_y: padding_y + remove_y,
  };
  addRect.call(this, bg_bbox_config);

  drawLayers.call(this, layers, {
    ratio,
    base_xmin,
    base_ymin,
    base_xmax,
    base_ymax,
    padding_x,
    padding_y,
    remove_x,
    remove_y,
    g,
    activeBbox,
  });
}

function drawLayers(layers, config) {
  let [
    ratio,
    base_xmin,
    base_ymin,
    padding_x,
    padding_y,
    remove_x,
    remove_y,
    g,
    activeBbox,
  ] = [
    config.ratio,
    config.base_xmin,
    config.base_ymin,
    // config.base_xmax,
    // config.base_ymax,
    config.padding_x,
    config.padding_y,
    config.remove_x,
    config.remove_y,
    config.g,
    config.activeBbox,
  ];

  layers.forEach((layer, index) => {
    // if (!layer.show) {
    //   return;
    // }

    // TODO 缺少数据
    let layerinfo = getRectInfo([
      activeBbox[0][0],
      activeBbox[0][1],
      activeBbox[1][0],
      activeBbox[1][1],
    ]);
    let [[layer_xmin, layer_ymin]] = activeBbox;

    let layer_bbox_config = {
      svg_father: g,
      svg_width: layerinfo.width / ratio,
      svg_height: layerinfo.height / ratio,
      svg_id: `CAD-LAYER-G-${index}`,
      svg_class: layer.isMark
        ? 'cad-layer-bbox-g cad-layer-mark'
        : 'cad-layer-bbox-g',
      svg_x: (layer_xmin - base_xmin) / ratio - padding_x + remove_x,
      svg_y: (layer_ymin - base_ymin) / ratio - padding_y + remove_y,
    };
    let layer_group = addGroup.call(this, layer_bbox_config);

    let points = [];
    layer.points.forEach((point) => {
      points.push([
        point[0] / ratio + padding_x - remove_x,
        yTrans(
          point[1] / ratio + padding_y - remove_y,
          this.project.svg.height
        ),
      ]);
    });
    let line_config = {
      svg_father: layer_group,
      svg_id: `CAD-LAYER-LINE-${index}`,
      svg_class: 'cad-layer-line cad-line-element',
      color: layer.colors,
      points: points,
      stroke_width: 1,
    };
    let line = addLine.call(this, line_config);
    chooseElement(line, this);
    // layer_bbox_config.svg_id = `CAD-LAYER-BBOX-${index}`;
    // layer_bbox_config.svg_class = 'cad-layer-bbox-rect';
    // layer_bbox_config.svg_father = layer_group;
    // addRect.call(this, layer_bbox_config);
  });
  // this.project.new.dxf_path[0].navigation[
  //   this.project.cad.active_navigation
  // ].bbox
  addLine.call(this, {
    svg_father: g,
    svg_id: `CAD-LAYER-navigation-active`,
    svg_class: 'cad-layer-line',
    color: 'active',
    points: formatBbox.call(this, activeBbox, {
      ratio,
      padding_x,
      padding_y,
      remove_x,
      remove_y,
    }),
    stroke_width: 4,
    fill_color: 'none',
  });

  let active_box = formatBbox.call(
    this,
    activeBbox,
    {
      ratio,
      padding_x,
      padding_y,
      remove_x,
      remove_y,
    },
    'center'
  );
  console.log('active_box: ', active_box);

  let menuNode = d3.select('#graphMenu').node();

  let move_x =
    this.project.svg.width / 2 - (active_box[0][0] + active_box[1][0]) / 2;
  let move_y =
    (this.project.svg.height +
      menuNode.offsetHeight -
      (active_box[0][1] + active_box[1][1])) /
    2;

  console.log('move_x: ', move_x);
  console.log('move_y: ', move_y);
  console.log('move_y: ', {
    height: this.project.svg.height,
    offsetHeight: menuNode.offsetHeight,
    min: active_box[0][1],
    max: active_box[1][1],
  });
  this.project.cad.svg.remove.x = move_x;
  this.project.cad.svg.remove.y = move_y;
  move(
    move_x,
    move_y,
    'cad-layer-bbox-g',
    ['cad-bbox-rect', 'cad-layer-bbox-rect'],
    ['cad-layer-line']
  );
}

function chooseElement(ele, data) {
  let elem = ele.node();
  elem.addEventListener('click', function(event) {
    d3.selectAll('.cad-line-element').attr('stroke-width', '1px');
    ele.attr('stroke-width', '3px');
  });
}

function formatBbox(bbox, config, type = 'bbox') {
  let [ratio, padding_x, padding_y, remove_x, remove_y] = [
    config.ratio,
    config.padding_x,
    config.padding_y,
    config.remove_x,
    config.remove_y,
  ];
  let points = [];
  bbox.forEach((point) => {
    points.push([
      point[0] / ratio + padding_x - remove_x,
      yTrans(point[1] / ratio + padding_y - remove_y, this.project.svg.height),
    ]);
  });
  console.log('points: ', points);
  if (type === 'bbox') {
    return [
      [points[0][0], points[0][1]],
      [points[1][0], points[0][1]],
      [points[1][0], points[1][1]],
      [points[0][0], points[1][1]],
      [points[0][0], points[0][1]],
    ];
  } else {
    return points;
  }
}
export { drawCadSvg };
