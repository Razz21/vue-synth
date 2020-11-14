<template>
  <base-controller v-bind="{ ...$props, ...$attrs }">
    <div class="knob">
      <div class="knob-dial" :style="{ color, width, height: width }">
        <div
          class="dial-grip handle "
          :style="{ '--rotate': $_scaledPosition }"
          v-on="controlHandlers"
          @wheel="$_handleMouseWheel"
        ></div>
        <svg viewBox="0 0 100 100">
          <path :d="rangeArc" fill="none" />
          <path :d="pathArc" fill="none" :stroke="color" class="dial-svg-arc" />
        </svg>
      </div>
    </div>
  </base-controller>
</template>

<script>
// knob constants;
const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;

import { clamp, scale, describeArc, polarToCartesian } from "@/utils";
import { ControlMixin } from "@/mixins/Control";
import variables from "@/assets/scss/_variables.scss";
import BaseController from "./BaseController";
export default {
  name: "Knob",
  mixins: [ControlMixin],
  components: { BaseController },
  props: {
    color: {
      type: String,
      default: variables.control
    },
    minDeg: {
      type: [String, Number],
      default: -135,
      validator: v => +v === +v // is numeric
    },
    maxDeg: {
      type: [String, Number],
      default: 135,
      validator: v => +v === +v // is numeric
    },
    width: {
      type: String,
      default: "3em"
    }
  },
  data() {
    return {};
  },
  computed: {
    $_scaledPosition() {
      return scale(this.position$, 0, 1, this.minDeg, this.maxDeg);
    },
    pathArc() {
      // return "M20,76 A 40 40 0 1 1 80 76";
      return `M ${this.startArc.x} ${this.startArc.y} A ${RADIUS} ${RADIUS} 0 ${this.largeArc} ${this.sweep} ${this.endArc.x} ${this.endArc.y}`;
    },
    rangeArc() {
      return describeArc(MID_X, MID_Y, RADIUS, this.minDeg, this.maxDeg);
    },
    endArc() {
      return polarToCartesian(MID_X, MID_Y, RADIUS, this.$_scaledPosition);
    },
    startArc() {
      return polarToCartesian(MID_X, MID_Y, RADIUS, this.positionZeroPoint);
    },
    largeArc() {
      return this.positionZeroPoint - this.$_scaledPosition < -180 ? 1 : 0;
    },
    positionPoint() {
      return scale(this.position$, 0, 1, this.minDeg, this.maxDeg);
    },
    positionZeroPoint() {
      let zeroVal;
      if (this.bipolar) {
        zeroVal = (0 + 1) / 2;
      } else {
        zeroVal = 0;
      }
      return scale(zeroVal, 0, 1, this.minDeg, this.maxDeg);
    },
    sweep() {
      return this.positionPoint >= this.positionZeroPoint ? 1 : 0;
      // return this.valuePoint >= this.zeroPoint ? 1 : 0;
    },
    /* depracated */

    valuePoint() {
      return scale(this.value, this.min, this.max, this.minDeg, this.maxDeg);
    },
    zeroPoint() {
      let zeroVal;
      if (this.bipolar) {
        zeroVal = (this.min + this.max) / 2;
      } else {
        zeroVal = this.min;
      }
      return scale(zeroVal, this.min, this.max, this.minDeg, this.maxDeg);
    }
  }
};
</script>

<style lang="scss" scoped>
.knob {
  display: inline-block;
  position: relative;

  &-dial {
    position: relative;
    display: block;
    // background: #2c2d2f;
    transform: translateY(16%);
    margin-top: -16%; // compensate
  }
  svg {
    pointer-events: none;
    position: absolute;
    stroke-width: 5;
    stroke: #55595c;
    .dial-svg-arc {
      filter: drop-shadow(0 0 1px);
    }
  }
}
.dial-grip {
  border-radius: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(calc(var(--rotate, 0) * 1deg));
  height: 65%;
  width: 65%;
  z-index: 1;
  background-color: #2c2d2f;

  &::before {
    content: "";
    z-index: 1;
    border-radius: inherit;
    position: absolute;
    width: 100%;
    height: 100%;
    transform: rotate(calc(var(--rotate, 0) * -1deg));
    background: linear-gradient(to bottom, #fff3, transparent);
    box-shadow: 0 0 0.04em 0.08em #000, 0 0.4em 0.4em 0 #111a, inset 0 0 0.08em 0.12em #181b1c;
  }
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    z-index: 2;
    width: 6%;
    transform: translateX(-50%);
    // -------------------------
    top: 0;
    height: 45%;
    border-radius: 0 0 2px 2px;
    background-color: #e4e8ea;
    mix-blend-mode: color-dodge;
    box-shadow: 0px 1px 1px 0px #000, inset 0 1px 1px 2px #aaa;
    // -------------------------
  }
}
</style>
