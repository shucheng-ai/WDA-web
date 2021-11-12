import * as d3 from 'd3';
import saveSvg from 'save-svg-as-png';

class Png {
  constructor(config, v) {
    this.config = config;
    // this.svg_config = svg_config;
    this.v = v;
    this.addPng();
  }

  log() {
    console.log('====');
    console.log(this.config);
    console.log(this.v);
    console.log('====');
  }

  addPng() {
    let that = this.v;
    let config = this.config;
    let [
      father_id,
      png_id,
      png_width,
      png_height,
      png_class,
      hide_class_list,
    ] = [
      config.father,
      config.png_id,
      config.png_width,
      config.png_height,
      config.png_class,
      config.hide_class_list,
    ];

    // let father = d3.select(`#${father_id}`);

    const svg = document.getElementById(`${father_id}`);
    let svg_clone = d3.select(`#${father_id}`).clone(true);
    hide_class_list.forEach((item) => {
      //TODO
      svg_clone.selectAll(`.${item}`).remove();
    });
    console.log('##svg: ', svg);

    // 现在最花时间的操作就是将svg转换为png
    saveSvg.svgAsPngUri(
      svg_clone.node(),
      { height: png_height, width: png_width, encoderOptions: 1 },
      (url) => {
        console.log('### url: ', url);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', 'CAD-PNG');
        a.click();
        // father
        //   .append('img')
        //   .attr('class', png_class)
        //   .attr('id', `${png_id}`)
        //   .attr('x', 0)
        //   .attr('y', 0)
        //   .attr('src', url)
        //   .attr('width', png_width)
        //   .attr('height', png_height);

        // that.show.main_loading = false;
      }
    );

    return this;
  }

  startPng() {
    d3.select(`#${this.config.father}`).classed('hidden', false);
    d3.select(`#${this.svg_config.father}`).style('opacity', '0');

    return this;
  }

  transformPng(rx, ry) {
    d3.select(`#${this.config.father}`).style(
      'transform',
      `translate(${rx}px, ${ry}px)`
    );

    return this;
  }

  hiddenPng(rx, ry) {
    let that = this.v;

    that.project.png.remove.x += rx;
    that.project.png.remove.y += ry;
    d3.select(`#${this.config.father}`)
      .classed('hidden', true)
      .style('transform', 'translate(0, 0)')
      .style('top', function() {
        // console.log('ry=== ' + ry);
        return `${that.project.png.remove.y}px`;
      })
      .style('left', function() {
        // console.log('rx=== ' + rx);
        return `${that.project.png.remove.x}px`;
      });
    d3.select(`#${this.svg_config.father}`).style('opacity', '1');

    return this;
  }

  removePng() {
    let that = this.v;

    // console.log('remove png')
    d3.select(`#${this.config.png_id}`).remove();
    d3.select(`#${this.config.father}`)
      .style('transform', 'translate(0, 0)')
      .style('top', 0)
      .style('left', 0);
    that.project.png.remove.x = 0;
    that.project.png.remove.y = 0;

    return this;
  }
}

export { Png };
