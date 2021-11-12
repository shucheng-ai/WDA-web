import * as d3 from 'd3';
import { d3XToCadX, d3YToCadY, getNumFixed } from './utils';
import { color_config } from '../../config/color.config';

function svgDrag(svg, v, config) {
  baseDrag.call(
    this,
    svg,
    v,
    'sc-bbox-g',
    ['sc-region-polygon', 'sc-bbox-rect'],
    [],
    'svg',
    config
  );
}

function cadDrag(svg, v, config) {
  baseDrag.call(
    this,
    svg,
    v,
    'cad-layer-bbox-g',
    ['cad-bbox-rect', 'cad-layer-bbox-rect', 'cad-layer-polygon'],
    ['cad-layer-line'],
    'cad',
    config
  );
}

const MARK_TEMP_G = 'mark-temp-g';

function baseDrag(
  svg,
  v,
  g_class,
  polygon_class_list,
  line_class_list,
  type,
  config
) {
  // let points = [];
  // let line = d3.line();

  // let path = d3
  //   .select(`#${config.svg_id}`)
  //   .append('path')
  //   .datum(points);
  // d3.select('.color-mark').on('mousedown', e => {
  // svg.on('mousedown', function(e) {
  //   console.log(e);
  // });

  // svg.on('mousewheel', function(e) {
  //   console.log(e);
  //   d3.select(this).attr('fill', 'green');
  //   d3.event.preventDefault();
  // });

  // d3.select('.sc-base-svg').call(
  //   d3
  //     .zoom()
  //     .scaleExtent([1, 3])
  //     .on('zoom', function() {
  //       // 不能直接对svg变形，否则无法标注，坐标会乱掉，只能调用zoomSvg变形。
  //       console.log(d3.event.transform);
  //       svg.attr('transform', d3.event.transform);
  //     })
  // );

  let mark_x = 0;
  let mark_y = 0;

  svg.call(
    d3
      .drag()
      .on('start', function() {
        console.log(`start drag x:${d3.event.x}, y:${d3.event.y}`);
        let point = formatZoomPoint(d3.event, 'BASE-CAD-G');
        // 引导相关
        if (
          Object.keys(v.project.cad.driver).length > 0 &&
          v.project.cad.driver.isActivated
        ) {
          v.project.cad.driver.reset(true);
        }

        if (!judgeCanDrag(type, v)) {
          mark_x = point.x;
          mark_y = point.y;
          config['g_id'] = 'BASE-CAD-G';

          console.log(d3.select(`#${config.g_id}`));
          console.log(d3.select(`#${config.g_id}>#${MARK_TEMP_G}`));
          d3.select(`#${config.g_id}>#${MARK_TEMP_G}`).remove();
          d3.select(`#${config.g_id}`)
            .append('g')
            .attr('id', MARK_TEMP_G);
          d3.select(`#${config.g_id}>#${MARK_TEMP_G}`)
            .append('polygon') //添加一个矩形
            .attr('stroke', color_config()[v.optMode])
            .attr('stroke-width', '1px') //todo
            .attr('fill-opacity', 0);
        } else {
          // console.log(`start drag x:${d3.event.x}, y:${d3.event.y}`);
          v.project.svg.drag.start_x = point.x;
          v.project.svg.drag.start_y = point.y;
          if (v.project.svg.png_mode) {
            v.project.png.obj.startPng();
          }
        }
      })
      .on('drag', function() {
        let point = formatZoomPoint(d3.event, 'BASE-CAD-G');
        if (!judgeCanDrag(type, v)) {
          // return false;

          let pointsStr = `${mark_x},${mark_y} ${point.x},${mark_y} ${point.x},${point.y} ${mark_x},${point.y} `;

          d3.select(`#${config.g_id}>#${MARK_TEMP_G}>polygon`).attr(
            'points',
            pointsStr
          );
        } else {
          // v.project.cad.svg.zoom.ratio
          let remove_x = point.x - v.project.svg.drag.start_x;
          let remove_y = point.y - v.project.svg.drag.start_y;
          // remove_x = v.project.svg.zoom.r * remove_x;
          // remove_y = v.project.svg.zoom.r * remove_y;
          // move(remove_x, remove_y, g_class, polygon_class_list);
          if (type === 'cad') {
            v.project.cad.svg.remove.x += 1 * remove_x;
            v.project.cad.svg.remove.y -= 1 * remove_y; //因为d3原点坐标在左上，而cad的原点坐标在左下
          }

          if (v.project.svg.png_mode) {
            v.project.png.obj.transformPng(remove_x, remove_y);
          } else {
            move(
              remove_x,
              remove_y,
              g_class,
              polygon_class_list,
              line_class_list
            );
            // v.project.svg.drag.start_x = point.x;
            // v.project.svg.drag.start_y = point.y;
          }
        }
      })
      .on('end', function() {
        let point = formatZoomPoint(d3.event, 'BASE-CAD-G');

        if (!judgeCanDrag(type, v)) {
          // return false;

          let base_x = getBaseMin.call(v, 'x');
          let base_y = getBaseMin.call(v, 'y');
          let ratio = v.project.cad.svg.ratio;
          let padding_x = v.project.cad.svg.padding.x;
          let padding_y = v.project.cad.svg.padding.y;
          let remove_x = v.project.cad.svg.remove.x;
          let remove_y = v.project.cad.svg.remove.y;
          let rect_height = Math.abs(point.y - mark_y);
          let rect_width = Math.abs(point.x - mark_x);
          // 误触检测
          if (rect_height < 3 || rect_width < 3) {
            d3.select(`#${config.g_id}>#${MARK_TEMP_G}`).remove();
            return false;
          }
          let gg = {
            mark_x,
            mark_y,
            base_x,
            base_y,
            ratio,
            padding_x,
            padding_y,
            remove_x,
            remove_y,
            svg_height: config.svg_height,
            rect_width,
            rect_height,
          };
          console.log('gg: ', gg);

          let x1 = d3XToCadX(mark_x, base_x, ratio, padding_x, remove_x);
          let y1 = d3YToCadY(
            mark_y,
            base_y,
            ratio,
            padding_y,
            remove_y,
            config.svg_height,
            rect_height
          );
          let x2 = d3XToCadX(point.x, base_x, ratio, padding_x, remove_x);
          let y2 = d3YToCadY(
            point.y,
            base_y,
            ratio,
            padding_y,
            remove_y,
            config.svg_height,
            rect_height
          );
          v.project.cad.svg.temp.bbox = [
            Math.min(x1, x2),
            Math.min(y1, y2),
            Math.max(x1, x2),
            Math.max(y1, y2),
          ];
          d3.select(`#${config.g_id}>#${MARK_TEMP_G}`).attr(
            'class',
            `temp-${v.project.cad.svg.temp.bbox[0]}`
          );

          addTempPolygon.call(v);
          v.project.new.dxf_path[0].top_view.push({
            points: [
              [x1, y1],
              [x2, y1],
              [x2, y2],
              [x1, y2],
              [x1, y1],
            ],
            colors: v.optMode,
          });
          v.project.cad.svg.show_mask_modal = true;

          console.log('mark end');
        } else {
          // console.log(`end drag x:${d3.event.x}, y:${d3.event.y}`);
          v.project.svg.drag.start_x = 0;
          v.project.svg.drag.start_y = 0;

          if (v.project.svg.png_mode) {
            let remove_x = point.x - v.project.svg.drag.start_x;
            let remove_y = point.y - v.project.svg.drag.start_y;
            // console.log(remove_x, remove_y);
            // console.log(`======end drag=====`);
            move(
              remove_x,
              remove_y,
              g_class,
              polygon_class_list,
              line_class_list
            );

            v.project.png.obj.hiddenPng(remove_x, remove_y);
          }
        }
      })
  );
}

function getBaseMin(type) {
  let index = this.project.cad.active_navigation;
  let bbox = this.project.new.dxf_path[0].navigation[index].bbox;
  if (['x', 'X'].includes(type)) {
    return bbox[0][0];
  } else if (['y', 'Y'].includes(type)) {
    return bbox[0][1];
  }
}
function judgeCanDrag(type, v) {
  let result = true;
  if (type === 'svg') {
    result = v.project.svg.canDrag;
  } else if (type === 'cad') {
    result = v.project.cad.svg.canDrag;
  }
  return result;
}
function addTempPolygon() {
  let that = this;
  // 确认后 将临时的polygon添加到svg中，让它们可以一起移动，当刷新后，此polygon会消失
  const SVG_ID = 'BASE-CAD-SVG';
  const G_ID = 'BASE-CAD-G';
  d3.select(`#${G_ID}`)
    // .append('polygon')
    .insert('polygon', '#CAD-STORAGE-G')
    .attr(
      'points',
      d3
        .select(`.temp-${this.project.cad.svg.temp.bbox[0]}>polygon`)
        .attr('points')
    )
    .attr(
      'class',
      `cad-layer-polygon cad-polygon-${
        this.optMode
      } CAD-LAYER-POLYGON-3-polygon color-mark mark-temp mark-${this.project.cad.svg.temp.bbox.join(
        '-'
      )}`
    )
    .attr('stroke', color_config()[this.optMode])
    .attr('stroke-width', '1px') //todo
    .attr('bbox', this.project.cad.svg.temp.bbox)
    .attr('type', this.project.cad.svg.temp.type)
    .attr('layer', this.project.cad.svg.temp.layer)
    .call(function(selection) {
      selection.on('dblclick', () => {
        // d3.select('.color-mark').on('dblclick', function() {
        console.log(selection);
        console.log(selection.attr('bbox').split(','));
        console.log(selection.attr('type'));
        console.log(selection.attr('layer'));
        that.project.cad.svg.temp.bbox = selection.attr('bbox').split(',');
        that.project.cad.svg.temp.type = selection.attr('type');
        that.project.cad.svg.temp.layer = selection.attr('layer');
        that.project.cad.svg.tempSelector = selection;
        that.project.cad.svg.edit_mask_modal = true;

        d3.event.preventDefault();
      });
      selection.on('mouseover', () => {
        if (!localStorage.hasMarkDriven) {
          const className = '.' + selection._groups[0][0].classList[4];
          console.log(selection);
          console.log(selection._groups[0][0].classList[4]);
          const steps = [
            {
              element: className,
              popover: {
                title: 'More Function',
                description:
                  'You can double click to delete or move front/back.',
                position: 'right',
              },
            },
          ];
          // setTimeout(() => {
          //   let d = createDriver(
          //     steps,
          //     {
          //       stageBackground: '#ffffff14',
          //     },
          //     this
          //   );
          //   localStorage.hasMarkDriven = true;
          //   console.log(d);
          // }, 0);
        }
      });
      selection.on('mousemove', () => {
        d3.select('text').remove();
        let polygon = selection.attr('points');
        d3.select('#BASE-CAD-SVG>g')
          .append('text')
          .attr('id', 'text_mark')
          .attr('fill', 'white')
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('cursor', 'pointer')
          .attr('dy', 8)
          .text(selection.attr('type'))
          .attr(
            'x',
            (Number(polygon.split(' ')[0].split(',')[0]) +
              Number(polygon.split(' ')[2].split(',')[0])) /
              2
          )
          .attr('y', polygon.split(' ')[3].split(',')[1]);
      });
      selection.on('mouseout', () => {
        d3.select('#text_mark').remove();
      });
    });

  d3.select(`#${G_ID}>#${MARK_TEMP_G}`).remove();
  that.optMode = 'drag';
  that.project.cad.svg.canDrag = true;
  orderImg();
}

function orderImg() {
  let img = d3.select('#CAD-STORAGE-G');
  img.raise();
}

function move(
  remove_x,
  remove_y,
  g_class,
  polygon_class_list,
  line_class_list
) {
  // d3.selectAll(`.${g_class}`)
  //   .attr('x', function() {
  //     let x = parseInt(d3.select(this).attr('x')) + remove_x;
  //     return x;
  //   })
  //   .attr('y', function() {
  //     let y = parseInt(d3.select(this).attr('y')) + remove_y;
  //     return y;
  //   });
  // if (line_class_list.length > 0) {
  //   moveLine(line_class_list, remove_x, remove_y);
  // }
  // if (polygon_class_list.length > 0) {
  //   movePolygon(polygon_class_list, remove_x, remove_y);
  // }
  const g_id = 'BASE-CAD-G';
  let transform = d3.zoomTransform(d3.select(`#${g_id}`).node());
  console.log('remove_x: ', remove_x);
  console.log('remove_y: ', remove_y);
  console.log('transform#: ', transform);
  transform.x = parseInt(transform.x) + getNumFixed(remove_x, 0);
  transform.y = parseInt(transform.y) + getNumFixed(remove_y, 0);
  d3.select(`#${g_id}`).attr('transform', transform);
}

function movePolygon(list, remove_x, remove_y) {
  list.forEach((item) => {
    d3.selectAll(`.${item}`).attr('points', function() {
      let new_points = '';
      let points = d3.select(this).attr('points');
      points = points.split(' ');
      points.forEach((point) => {
        if (point) {
          let [x, y] = [
            parseInt(point.split(',')[0]),
            parseInt(point.split(',')[1]),
          ];
          x += remove_x;
          y += remove_y;
          new_points += `${x},${y} `;
        }
      });
      return new_points;
    });
  });
}

function moveLine(list, remove_x, remove_y) {
  var linePath = d3.line();
  list.forEach((item) => {
    d3.selectAll(`.${item}`)
      .attr('d', function() {
        let new_points = [];
        let points = d3.select(this).attr('points');
        points = points.split(' ');
        points.forEach((point) => {
          if (point) {
            let [x, y] = [
              parseInt(point.split(',')[0]),
              parseInt(point.split(',')[1]),
            ];
            x += remove_x;
            y += remove_y;
            new_points.push([x, y]);
          }
        });
        return linePath(new_points);
      })
      .attr('points', function() {
        let new_points = [];
        let points = d3.select(this).attr('points');
        points = points.split(' ');

        points.forEach((point) => {
          if (point) {
            let [x, y] = [
              parseInt(point.split(',')[0]),
              parseInt(point.split(',')[1]),
            ];
            x += remove_x;
            y += remove_y;
            new_points.push([x, y]);
          }
        });
        return new_points.join(' ');
      });
  });
}

function formatZoomPoint(point, g_id) {
  let transform = d3.zoomTransform(d3.select(`#${g_id}`).node());
  // console.log('transform: ', transform);
  let result = {};
  result['x'] = getNumFixed((point.x - transform.x) / transform.k, 2);
  result['y'] = getNumFixed((point.y - transform.y) / transform.k, 2);
  return result;
}

export { svgDrag, cadDrag, move };
