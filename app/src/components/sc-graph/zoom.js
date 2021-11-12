import * as d3 from 'd3';


function addzoom(svg, w, h, v) {
  svg.call(d3.zoom()
    .extent([[0, 0], [w * 2, h * 2]])
    .scaleExtent([1, 10])
    .on('zoom', function () {
      svg.attr('transform', function () {
        let [r, x, y] = [
          d3.event.transform.k,
          d3.event.transform.x,
          d3.event.transform.y,
        ];
        // console.log(d3.event.transform);
        // console.log(r, x, y);
        // console.log(d3.event);
        v.project.svg.zoom.r = r;
        v.project.svg.zoom.x = x;
        v.project.svg.zoom.y = y;
        return d3.event.transform
      });
    }));
}


export {addzoom}