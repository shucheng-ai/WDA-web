async function init() {
  this.show_greenfield = !this.show_greenfield;
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
}

function clear() {
  console.log('clear');
  this.$store.commit('SET_POINTSARR', []);
  this.$refs.sc_canvas.clear();
}

export { init, redraw, getDistance, generate, clear };
