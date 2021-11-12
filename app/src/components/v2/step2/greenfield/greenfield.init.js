async function init() {
  this.$emit('update:show_greenfield', !this.show_greenfield);
}

async function redraw() {
  this.$refs.sc_canvas.render(this.$store.getters.truePointsArr);
}

function getDistance(point, index) {
  let result = 0;
  console.log('point: ', point);
  console.log('index: ', index);
  let arr = this.$store.getters.truePointsArr;
  if (index !== arr.length - 1) {
    result = this.$refs.sc_canvas.getTwoPointDistance(
      point.x,
      point.y,
      arr[index + 1].x,
      arr[index + 1].y,
      2
    );
  } else {
    result = this.$refs.sc_canvas.getTwoPointDistance(
      point.x,
      point.y,
      arr[0].x,
      arr[0].y,
      2
    );
  }
  console.log('result: ', result);
  return result;
}

function generate() {
  console.log('generate');
  let points = [];
  let set_x = new Set();
  let set_y = new Set();
  this.$store.getters.truePointsArr.forEach((truePoint) => {
    set_x.add(truePoint.x);
    set_y.add(truePoint.y);
    points.push([truePoint.x * this.ratio, truePoint.y * this.ratio]);
  });
  let min_x = Math.min.apply(Math, Array.from(set_x)) * this.ratio;
  let max_x = Math.max.apply(Math, Array.from(set_x)) * this.ratio;
  let min_y = Math.min.apply(Math, Array.from(set_y)) * this.ratio;
  let max_y = Math.max.apply(Math, Array.from(set_y)) * this.ratio;
  // 结尾添加开头
  points.push([
    this.$store.getters.truePointsArr[0].x * this.ratio,
    this.$store.getters.truePointsArr[0].y * this.ratio,
  ]);

  const param = {
    project_id: this.$store.state.project.project_id,
    scene: {
      top_view_bbox: [
        [min_x, min_y],
        [max_x, max_y],
      ],
      top_view: [
        {
          points: points,
          color: 'wall',
        },
      ],
    },
  };
  console.log('param: ', param);
  let res = this.$model.cad.generateGreenfield(param);
  res.then((resp) => {
    console.log('resp: ', resp);
    this.$emit('init'); //通过$emit触发父组件
  });
}

function clear() {
  console.log('clear');
  this.$store.commit('SET_POINTSARR', []);
  this.$parent.$refs.sc_canvas.clear();
}

export { init, redraw, getDistance, generate, clear };
