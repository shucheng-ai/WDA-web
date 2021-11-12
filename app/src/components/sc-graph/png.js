import * as d3 from 'd3';
import './png.less';
import saveSvg from 'save-svg-as-png';

class Png {
  constructor(config, svg_config, v) {
    this.config = config;
    this.svg_config = svg_config;
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
    let [father_id, png_id, png_width, png_height, png_class] = [
      config.father,
      config.png_id,
      config.png_width,
      config.png_height,
      config.png_class,
    ];
    
    let father = d3.select(`#${father_id}`);
    // console.log('size===='+d3.select(`.${png_class}`).size());
    if(d3.select(`.${png_class}`).size() > 0) {
      d3.select(`#${this.svg_config.father}`).style('opacity', '0');
      return false;
    }
    father.attr('rx', 0).attr('ry', 0);
    // console.log('init img');
  
    const svg = document.getElementById(`${this.svg_config.svg_id}`);
  
    // 现在最花时间的操作就是将svg转换为png
    saveSvg.svgAsPngUri(svg,{height:png_height,width:png_width, encoderOptions: 1}, (url) => {
      father.append('img').attr('class', png_class).attr('id', `${png_id}`)
        .attr('x', 0).attr('y', 0)
        .attr('src', url)
        .attr('width', png_width.toFixed(2))
        .attr('height', png_height.toFixed(2));
    
      that.show.main_loading = false;
    });
  
    return this;
  }
  
  startPng() {
    d3.select(`#${this.config.father}`).classed('hidden', false);
    d3.select(`#${this.svg_config.father}`).style('opacity', '0');

    return this;
  }
  
  transformPng(rx, ry) {
    d3.select(`#${this.config.father}`).style('transform', `translate(${rx}px, ${ry}px)`);

    return this;
  }
  
  hiddenPng(rx, ry) {
    let that = this.v;

    that.project.png.remove.x += rx;
    that.project.png.remove.y += ry;
    d3.select(`#${this.config.father}`).classed('hidden', true).style('transform', 'translate(0, 0)').style('top', function() {
      // console.log('ry=== ' + ry);
      return `${that.project.png.remove.y}px`;
    }).style('left', function() {
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
    d3.select(`#${this.config.father}`).style('transform','translate(0, 0)').style('top', 0).style('left', 0);
    that.project.png.remove.x = 0;
    that.project.png.remove.y = 0;

    return this;
  }
}

// function addPng(x, y) {
//   let config = {
//     father: 'png',
//     png_id: 'BASE-PNG',
//     png_width: this.project.svg.width,
//     png_height: this.project.svg.height,
//     png_class: 'sc-base-png',
//   };
//   let that = this;
//   let [father_id, png_id, png_width, png_height, png_class] = [
//     config.father,
//     config.png_id,
//     config.png_width,
//     config.png_height,
//     config.png_class,
//   ];
  
//   let father = d3.select(`#${father_id}`);
//   console.log('size===='+d3.select(`.${png_class}`).size());
//   if(d3.select(`.${png_class}`).size() > 0) {
//     d3.select('#svg').style('opacity', '0');
//     return false;
//   }
//   father.attr('rx', 0).attr('ry', 0);
//   console.log('init img')

//   // ↓ 第一部分
//   const svg = document.getElementById('BASE-SVG');

//   saveSvg.svgAsPngUri(svg,{height:png_height,width:png_width, encoderOptions: 1}, (url) => {
//     const png = father.append('img').attr('class', png_class).attr('id', `${png_id}`)
//     .attr('x', 0).attr('y', 0)
//     .attr('src', url)
//     .attr('width', png_width.toFixed(2))
//     .attr('height', png_height.toFixed(2));
  
//     that.show.main_loading = false;
//   });

//   return true;
// }

// function startPng() {
//   d3.select('#png').classed('hidden', false);
//   d3.select('#svg').style('opacity', '0');
// }

// function transformPng(rx, ry) {
//   // console.log(rx, ry);
//   let x, y;
//   // d3.selectAll(`#BASE-PNG`).attr('x', function () {
//   //   x = parseInt(d3.select(this).attr('x')) + rx;
//   //   return x
//   // }).attr('y', function () {
//   //   y = parseInt(d3.select(this).attr('y')) + ry;
//   //   return y
//   // });
//   // this.project.png.remove.x += x; //TODO 重复相加
//   // this.project.png.remove.y += y;
//   // let svgx = d3.select('#BASE-PNG').attr('x');
//   // let svgy= d3.select('#BASE-PNG').attr('y');
//   d3.select('#png').style('transform', `translate(${rx}px, ${ry}px)`);
// }

// function hiddenPng(rx, ry) {
//   this.project.png.remove.x += rx;
//   this.project.png.remove.y += ry;
//   let that = this;
//   d3.select('#png').classed('hidden', true).style('transform', `translate(0, 0)`).style('top', function() {
//     console.log('ry=== ' + ry);
//     // return -(parseInt(d3.select('#png').attr('ry')) + ry);
//     return `${that.project.png.remove.y}px`;
//   }).style('left', function() {
//     console.log('rx=== ' + rx);
//     // return (parseInt(d3.select('#png').attr('rx')) + rx);
//     return `${that.project.png.remove.x}px`;
//   });
//   d3.select('#svg').style('opacity', '1');
// }

// function removePng() {
//   console.log('remove png')
//   d3.select('#BASE-PNG').remove();
//   d3.select('#png').style('transform', `translate(0, 0)`).style('top', 0).style('left', 0);
//   this.project.png.remove.x = 0;
//   this.project.png.remove.y = 0;
// }

export { Png }