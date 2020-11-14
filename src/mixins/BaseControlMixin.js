import { scale } from "@/utils";
export const BaseControlMixin = {
  methods: {
    positionToValue(position) {
      return scale(position, 0, 1, this.min$, this.max$);
    },
    valueToPosition(value) {
      return scale(value, this.min$, this.max$, 0, 1);
    }
  }
};
