import { scale } from "@/utils";
export const StepControlMixin = {
  methods: {
    positionToValue(position) {
      const res = ~~((position * this.$_valueSpread) / this.step) * this.step + this.min$;
      return res;
    },
    valueToPosition(value) {
      return scale(value, this.min$, this.max$, 0, 1);
    }
  }
};
