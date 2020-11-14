export const LogControlMixin = {
  methods: {
    positionToValue(position) {
      const min = this.min$ === 0 ? 0.001 : this.min$;
      const max = this.max$ === 0 ? this.max$ - 0.001 : this.max$;
      return Math.exp(Math.log(min) + position * (Math.log(max) - Math.log(min)));
    },
    valueToPosition(value) {
      const min = this.min$ === 0 ? 0.001 : this.min$;
      const max = this.max$ === 0 ? this.max$ - 0.001 : this.max$;
      return (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));
    }
  }
};
