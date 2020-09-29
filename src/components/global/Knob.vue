<template>
  <div :class="['knob', 'style' + knob.style]">
    <div
      class="knob-active-light"
      :style="{ 'background-color': knob.active ? knob.color : '#888' }"
      @click="knob.active = !knob.active"
    ></div>
    <div class="knob-dial" :style="{ color: knob.active ? knob.color : '#888' }">
      <div class="knob-labels">
        <div
          v-for="(option, index) in _options"
          :key="index"
          class="knob-label-anchor"
          :style="{ '--angle': option.angle }"
        >
          <div class="knob-label-tick"></div>
          <div v-if="option.label" class="knob-label-text">
            <div v-html="option.label" />
          </div>
        </div>
      </div>
      <div
        class="dial-grip"
        :style="{ transform: 'translate(-50%,-50%) rotate(' + rotation + 'deg)' }"
        @mousedown="handleMouseDown"
        @wheel="handleMouseWheel"
        @dblclick="handleDbClick"
      ></div>
      <svg class="dial-svg" viewBox="0 0 100 100">
        <path :d="rangeArc" fill="none" stroke="#55595C" ref="path" />
        <path :d="pathArc" fill="none" :stroke="knob.active ? knob.color : '#888'" />
      </svg>
    </div>
    <div class="knob-label" :style="{ color: knob.active ? '#E4E8EA' : '#888' }">
      {{ knob.label }}

      <!-- <p>{{ zeroPoint - rotation }}</p> -->
    </div>
  </div>
</template>

<script>
// TODO return object property in option, like in Vuetify select
// TODO handle mousewheel / touch / keypress / dbCLick / precision

// knob constants;
const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;

import { clamp, scale, describeArc, polarToCartesian } from "@/utils";
export default {
  props: {
    sensitivity: {
      type: [Number, String],
      default: 2
    },
    minValue: {
      type: [Number, String],
      default: 0
    },
    maxValue: {
      type: [Number, String],
      default: 100
    },
    value: null,
    knob: {
      type: Object,
      required: true
    },
    options: {
      type: [Array, String, Number],
      validator: v => (Array.isArray(v) && v.length) || (Number.isInteger(v) && v > 0) // array of values or number of steps
    },
    default: {
      // todo reset to default
      type: [Number, String],
      default: 0
    },
    minDeg: {
      type: [String, Number],
      default: -132,
      validator: v => +v === +v // is numeric
    },
    maxDeg: {
      type: [String, Number],
      default: 132,
      validator: v => +v === +v // is numeric
    }
  },
  data() {
    return {
      currentY: 0,
      rotation: 0,
      wheelResistance: 1, // mouse wheel sensitivity; more > slower (more accurate change)
      _temp: 0 // keep init rotation value during mouse hold to calculate relative move change in steps mode
    };
  },
  computed: {
    pathArc() {
      // return "M20,76 A 40 40 0 1 1 80 76";
      return `M ${this.startArc.x} ${this.startArc.y} A ${RADIUS} ${RADIUS} 0 ${this.largeArc} ${this.sweep} ${this.endArc.x} ${this.endArc.y}`;
    },
    rangeArc() {
      return describeArc(MID_X, MID_Y, RADIUS, this.minDeg, this.maxDeg);
    },
    zeroPoint() {
      return scale(0, this.minValue, this.maxValue, this.minDeg, this.maxDeg);
    },
    valuePoint() {
      return scale(this.value, this.minValue, this.maxValue, this.minDeg, this.maxDeg);
    },
    endArc() {
      return polarToCartesian(MID_X, MID_Y, RADIUS, this.rotation);
    },
    startArc() {
      return polarToCartesian(MID_X, MID_Y, RADIUS, this.zeroPoint);
    },
    largeArc() {
      return this.zeroPoint - this.rotation < -180 ? 1 : 0;
    },
    sweep() {
      return this.valuePoint > this.zeroPoint ? 1 : 0;
    },
    arcRange() {
      const degrees = this.maxDeg - this.minDeg;
      const options = Array.isArray(this.options) ? this.options.length : +this.options;
      return degrees / (options - 1);
    },
    _options() {
      if (!this.options) return null;
      let options;
      if (Array.isArray(this.options)) {
        options = this.options;
      } else {
        // create array of empty object in options range
        // Note: Array.fill() create references to the same object, we need array of multiple objects here
        options = new Array(this.options);
        for (let i = 0; i < this.options; i++) {
          options[i] = {};
        }
      }
      return options.map(this.formatOption);
    }
  },
  methods: {
    // utils
    rotationToValue(rotation) {
      /*
      convert fixed knob rotation value (from this.minDeg to this.maxDeg) to custom minValue/maxValue range
      */
      const value = scale(rotation, this.minDeg, this.maxDeg, this.minValue, this.maxValue);
      this.$emit("input", value);
    },
    valueToRotation(val) {
      return scale(val, this.minValue, this.maxValue, this.minDeg, this.maxDeg);
    },
    init() {
      // initialize knob position
      this.clearDrag();
      this.rotation = this.valueToRotation(this.value);
    },

    formatOption(o, i) {
      o["angle"] = 180 + this.minDeg + Math.round(this.arcRange * i * 100) / 100;
      return o;
    },
    // event handlers

    handleMouseMove(e) {
      if (!this.knob.selected) return;
      // console.log("mouse-move");

      let rotation = this.rotation;

      // Knob Rotation
      if (this.options) {
        // let delta = Math.round((this.currentY - e.pageY) / this.arcRange) * this.arcRange + this.minDeg;
        // snap to options values
        let delta = Math.round((this.currentY - e.pageY) / this.arcRange) * this.arcRange;
        rotation = this._temp + delta;
      } else if (e.pageY - this.currentY !== 0) {
        // free mode
        rotation -= (e.pageY - this.currentY) * this.sensitivity;
        this.currentY = e.pageY;
      }
      // Setting Min/Max rotation
      this.updateDrag(rotation);
    },
    handleMouseUp(e) {
      console.log("mouse-up");
      this.currentY = e.pageY;
      this._temp = 0;
      this.clearDrag();
    },
    handleMouseDown(e) {
      console.log("mouse-down");
      this.knob.selected = true;
      this.currentY = e.pageY;
      this._temp = this.rotation;
      e.preventDefault();
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseup", this.handleMouseUp);
    },
    handleMouseWheel(e) {
      this.knob.selected = true;
      this.clearDrag();
      this.updateFromDrag(e.deltaY, this.wheelResistance);
    },
    handleDbClick() {
      const rotation = this.valueToRotation(this.default);
      this.updateDrag(rotation);
    },
    updateDrag(rotation) {
      const clampValue = clamp(rotation, this.minDeg, this.maxDeg);
      this.rotation = clampValue;
      this.rotationToValue(clampValue);
    },
    clearDrag() {
      this.knob.selected = false;
      window.removeEventListener("mousemove", this.handleMouseMove);
      window.removeEventListener("mouseup", this.handleMouseUp);
    },

    updateFromDrag(dragAmount, resistance) {
      let rotation;
      if (this.options) {
        // snap to options values
        rotation = this.rotation - Math.sign(dragAmount) * this.arcRange;
      } else {
        rotation = this.rotation - dragAmount / resistance;
      }
      this.updateDrag(rotation);
    }
  },
  mounted() {
    // console.clear();
    this.init();
  },
  beforeDestroy() {
    this.clearDrag();
  }
};
</script>

<style lang="scss" scoped>
.knob {
  display: inline-block;
  border-radius: 3px;
  padding: 20px;
  background-color: #2c2d2f;
  margin: 0 10px 10px 0;
  position: relative;
  &.style1 {
    .dial-grip {
      height: 72px;
      width: 72px;
      border: 6px solid #181b1c;
      &::after {
        position: absolute;
        top: 5px;
        left: 50%;

        height: 10px;
        background-color: #e4e8ea;
      }
    }
  }
  &.style2 {
    .dial-svg {
      stroke-width: 2.5;
    }
    .dial-grip {
      height: 60px;
      width: 60px;
      background-color: #888;
      &::after {
        height: 15px;
        background-color: #2c2d2f;
      }
    }
  }
  &.style3 {
    .dial-svg {
      stroke-width: 2.75;
    }
    .dial-grip {
      z-index: 5;
      height: 82px;
      width: 82px;
      transition: 0.3s cubic-bezier(0, 0, 0.24, 1);
      &::after {
        height: 25px;
        width: 3px;
        border-radius: 4px;
        background-color: currentColor;
      }
    }
  }
  &-active-light {
    position: absolute;
    top: 12px;
    left: 12px;

    height: 10px;
    width: 10px;
    border-radius: 100%;
  }
  &-dial {
    position: relative;
    height: 100px;
    width: 100px;
    text-align: left !important;
    transition: 0s;
  }
  &-label {
    user-select: none;
  }
}
.dial-grip {
  border-radius: 100%;
  transition: 0s;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
  }
}
.dial-svg {
  pointer-events: none;
  position: absolute;
  stroke-width: 5;
  stroke-dasharray: 184 184;
  // stroke-linecap: round !important;
  path {
    transition: stroke 0.3s cubic-bezier(0, 0, 0.24, 1);
  }
}

/*
options labels
*/
.knob-labels {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  font-size: 1rem;
}

.knob-label-tick {
  transform-origin: center center;
  width: 2px;
  height: 10px;
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translateX(-50%);
  background: #aaa;
}

.knob-label-anchor {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 50%;
  word-break: keep-all;
  white-space: nowrap;
  transform-origin: top left;
  z-index: 1;
  transform: rotate(calc(var(--angle) * 1deg));
}

.knob-label-text {
  color: #fff;
  transform-origin: center center;
  margin: 0.7em;
  width: 1em;
  height: 1em;
  line-height: 1em;
  position: absolute;
  cursor: pointer;
  top: 100%;
  transform: translate(-100%, -20%) rotate(calc(var(--angle) * -1deg));
  font-size: 0.7em;
}
</style>
