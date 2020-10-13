class Log {
  constructor(opts) {
    this.minpos = opts.minpos || 0;
    this.maxpos = opts.maxpos || 100;

    this.minval = Math.log(opts.minval || 0.001); // > 0
    this.maxval = Math.log(opts.maxval || 100);

    this.scale = (this.maxval - this.minval) / (this.maxpos - this.minpos);
  }

  value(position) {
    return Math.exp((position - this.minpos) * this.scale + this.minval);
  }

  position(value) {
    if (value === 0) return 0;
    return this.minpos + (Math.log(value) - this.minval) / this.scale;
  }
}

export default Log;
