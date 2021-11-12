import { init, redraw, getDistance, clear, generate } from './greenfield.init';

class Greenfield {
  constructor() {}

  init() {
    init.call(this);
  }

  redraw() {
    redraw.call(this);
  }

  getDistance(point, index) {
    getDistance.call(this, point, index);
  }

  clear() {
    clear.call(this);
  }

  generate() {
    generate.call(this);
  }
}

export default Greenfield;
