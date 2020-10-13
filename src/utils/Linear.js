import { scale } from "./index";

class Linear {
  constructor(opts) {
    this.minpos = opts.minpos || 0;
    this.maxpos = opts.maxpos || 100;

    this.minval = opts.minval || 0;
    this.maxval = opts.maxval || 100;
  }

  value(position) {
    return scale(position, this.minpos, this.maxpos, this.minval, this.maxval);
  }

  position(value) {
    return scale(value, this.minval, this.maxval, this.minpos, this.maxpos);
  }
}

export default Linear;
