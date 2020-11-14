export const ExpControlMixin = {
  methods: {
    positionToValue(position) {
      return this.min$ + Math.pow(position, this.exp) * this.$_valueSpread;
    },
    valueToPosition(value) {
      return Math.pow((value - this.min$) / this.$_valueSpread, 1 / this.exp);
    }
  }
};
