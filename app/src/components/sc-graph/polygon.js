import { yTrans } from './utils';
import * as d3 from 'd3';
import { createDriver } from './driver';

function addPolygon(config) {
  // console.log(config);
  let [svg_father, svg_id, svg_class, points, color, svg_height, annotation] = [
    config.svg_father,
    config.svg_id,
    config.svg_class,
    config.points,
    config.color,
    config.svg_height,
    config.annotation,
  ];
  let class_name = `${svg_id}-polygon`;
  // d3.selectAll(`.${class_name}`).remove();
  class_name = `${svg_class} ${class_name} color-${color}`;
  if (annotation) {
    class_name += ` mark-${annotation.bbox.join('-')}`;
  }
  let that = this;
  let polygon = '';
  points.forEach((i) => {
    let [x, y] = [i[0], yTrans(i[1], svg_height, 0)];
    x = x.toFixed(2);
    y = y.toFixed(2);
    polygon += `${x},${y} `;
  });
  let data = svg_father
    .append('polygon')
    .attr('points', polygon)
    .attr('type', annotation ? annotation.type : null)
    .attr('layer', annotation ? annotation.layer : null)
    .attr('bbox', annotation ? annotation.bbox : null)
    .attr('class', class_name)
    .call(function(selection) {
      if (annotation) {
        selection.on('dblclick', () => {
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
            const className = '.' + selection._groups[0][0].classList[3];
            console.log(selection);
            console.log(selection._groups[0][0].classList[3]);
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
            setTimeout(() => {
              let d = createDriver(
                steps,
                {
                  stageBackground: '#ffffff14',
                },
                this
              );
              localStorage.hasMarkDriven = true;
              console.log(d);
            }, 0);
          }
        });
        selection.on('mousemove', () => {
          d3.select('text').remove();
          // console.log(selection);
          // console.log(selection._groups[0][0].animatedPoints);

          data = svg_father
            .append('text')
            .attr('id', 'text_mark')
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('cursor', 'pointer')
            .attr('dy', 8)
            .text(annotation.type)
            .attr(
              'x',
              (selection._groups[0][0].animatedPoints[0].x +
                selection._groups[0][0].animatedPoints[2].x) /
                2
            )
            .attr(
              'y',
              Math.max(
                selection._groups[0][0].animatedPoints[0].y,
                selection._groups[0][0].animatedPoints[1].y,
                selection._groups[0][0].animatedPoints[2].y,
                selection._groups[0][0].animatedPoints[3].y
              )
            );
        });
        selection.on('mouseout', () => {
          d3.select('#text_mark').remove();
        });
      }
    });

  return data;
}

export { addPolygon };
