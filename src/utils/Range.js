class Range {
  constructor({ opts }) {
    this.minpos = opts.minpos || 0;
    this.maxpos = opts.maxpos || 100;
    this.minval = opts.minval || 0;
    this.maxval = opts.maxval || 100;
    this.steps = opts.steps || 100;
  }

  withProvider(provider) {
    this.provider = provider;
    return this;
  }

  value(position) {
    return this.provider.value(position);
  }

  position(value) {
    return this.provider.position(value);
  }
}
