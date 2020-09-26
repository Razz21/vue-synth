<template>
  <div :class="['knob', 'style' + knob.style]">
    <div
      class="knob-active-light"
      :style="{ 'background-color': knob.active ? knob.color : '#888' }"
      @click="knob.active = !knob.active"
    ></div>
    <div class="knob-dial" :style="{ color: knob.active ? knob.color : '#888' }">
      <div
        class="dial-grip"
        :style="{ transform: 'translate(-50%,-50%) rotate(' + knob.rotation + 'deg)' }"
        @mousedown="handleMouseDown"
      ></div>
      <svg class="dial-svg" viewBox="0 0 100 100">
        <path d="M20,76 A 40 40 0 1 1 80 76" fill="none" stroke="#55595C" />
        <path
          d="M20,76 A 40 40 0 1 1 80 76"
          fill="none"
          :stroke="knob.active ? knob.color : '#888'"
          :style="{ 'stroke-dashoffset': 184 - 184 * ((knob.rotation * 1 + 132) / 264) }"
        />
      </svg>
    </div>
    <div class="knob-label" :style="{ color: knob.active ? '#E4E8EA' : '#888' }">
      {{ knob.label }}
      <p>{{ value.toFixed(1) }}</p>
    </div>
  </div>
</template>

<script>
// TODO return value between min/max
export default {
  data() {
    return {
      currentY: 0,
      min: -100,
      max: 100,
      value: 0,
      knob: {
        id: 0,
        label: "Test Knob",
        rotation: -132,
        color: "#FA9C34",
        active: true,
        selected: false,
        style: 1
      }
    };
  },
  methods: {
    // utils
    clampValue(val) {
      //TODO dynamic values
      var min = -132;
      var max = 132;
      return Math.min(Math.max(val, min), max);
    },
    normalizeValue(val) {
      return (val - this.min) / (this.max - this.min);
    },
    scale(inputY, yRange, xRange) {
      const [xMin, xMax] = xRange;
      const [yMin, yMax] = yRange;
      const percent = (inputY - yMin) / (yMax - yMin);
      const outputX = percent * (xMax - xMin) + xMin;
      return outputX;
    },

    rotationToValue() {
      /*
      convert fixed knob rotation value (from -132 to 132) to custom min/max range
      */
      const input = this.knob.rotation,
        yRange = [-132, 132],
        xRange = [this.min, this.max];
      this.value = this.scale(input, yRange, xRange);
    },
    valueToRotation() {
      // initialize knob position
      const input = this.value,
        xRange = [-132, 132],
        yRange = [this.min, this.max];
      this.knob.rotation = this.scale(input, yRange, xRange);
    },
    init() {
      this.valueToRotation();
    },
    handleMouseMove(e) {
      if (!this.knob.selected) return;
      console.log("mouse-move");

      let rotation = this.knob.rotation;
      // Knob Rotation

      if (e.pageY - this.currentY !== 0) {
        this.knob.rotation -= e.pageY - this.currentY;
      }
      this.currentY = e.pageY;
      // Setting Max rotation
      this.knob.rotation = this.clampValue(this.knob.rotation);
      this.rotationToValue();
    },
    handleMouseUp(e) {
      console.log("mouse-up");
      // this.currentY = 0;
      this.clearDrag();
    },
    handleMouseDown(e) {
      console.log("mouse-down");
      this.knob.selected = true;
      this.currentY = e.pageY;
      e.preventDefault();
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseup", this.handleMouseUp);
    },
    clearDrag() {
      this.knob.selected = false;
      window.removeEventListener("mousemove", this.handleMouseMove);
      window.removeEventListener("mouseup", this.handleMouseUp);
    }
  },
  mounted() {
    console.clear();
    this.init();
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
</style>
