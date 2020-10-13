<script>
const RAD2DEG = 180 / Math.PI;
const ROTATE_MIN = 45;
const ROTATE_MAX = 315;
export default {
  props: {
    value: null,
    domain: Array,
    size: {
      type: [String, Number],
      default: "100px"
    }
  },
  data() {
    return {
      startDeg: 0,
      rotation: 0,
      xy: [],
      tmp: 0
    };
  },
  methods: {
    onMouseDown(e) {
      const bb = e.target.getBoundingClientRect();
      this.xy = [window.scrollX + bb.left + bb.width / 2, window.scrollY + bb.top + bb.height / 2];
      this.rotation = this.getRotationFromValue(this.value);
      // console.log(this.rotation);
      this.startDeg = -1;
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);
    },
    onMouseMove(e) {
      let deg = Math.atan2(this.xy[1] - e.pageY, this.xy[0] - e.pageX) * RAD2DEG - 90;

      if (deg < 0) {
        deg = 360 + deg;
      }
      if (this.startDeg === -1) {
        this.startDeg = deg;
      }

      let tmp = Math.floor(deg - this.startDeg + this.rotation);
      if (tmp < 0) {
        tmp = 360 + tmp;
      } else if (tmp > 359) {
        tmp = tmp % 360;
      }

      if (tmp < ROTATE_MIN) {
        tmp = ROTATE_MIN;
      } else if (tmp > ROTATE_MAX) {
        tmp = ROTATE_MAX;
      }
      this.tmp = tmp;

      this.$emit("input", this.getValueFromRotation(tmp));
    },
    onMouseUp(e) {
      this.$emit("input", this.getValueFromRotation(this.tmp));
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("mouseup", this.onMouseUp);
    },
    getRotationFromValue(value) {
      const d = this.domain;
      value = Math.min(Math.max(value, d[0]), d[1]);
      return ROTATE_MIN + ((value - d[0]) / (d[1] - d[0])) * (ROTATE_MAX - ROTATE_MIN);
    },
    getValueFromRotation(r) {
      const d = this.domain;
      return d[0] + (d[1] - d[0]) * ((r - ROTATE_MIN) / (ROTATE_MAX - ROTATE_MIN));
    },
    renderTicks(h, rotate) {
      const COUNT = 19;
      const INCR = Math.floor((ROTATE_MAX - ROTATE_MIN) / COUNT);
      const START = ROTATE_MIN + 180;
      const END = ROTATE_MAX + 180;
      rotate = rotate + 180;
      let ticks = [];
      for (let deg = START; deg <= END; deg += INCR) {
        ticks.push(
          h("div", {
            class: ["tick", deg <= rotate ? " active" : ""],
            style: { transform: `rotate(${deg}deg)` }
          })
        );
      }
      return ticks;
    }
  },
  render(h) {
    const rotate = this.getRotationFromValue(this.value);
    const styleControl = { height: this.size, width: this.size, transform: `rotate(${rotate}deg)` };
    const styleTicks = { height: this.size, width: this.size };
    const style = { height: this.size, width: this.size, "--size": this.size };
    return h("div", { class: "knob-control", style: style }, [
      h("div", { class: "control" }, [
        h("div", { class: "ticks", style: styleTicks }, [this.renderTicks(h, rotate)]),
        h("div", { class: "knob", style: styleControl, on: { mousedown: this.onMouseDown } })
      ])
    ]);
  }
};
</script>

<style lang="scss" scoped>
.pot {
  display: inline-block;
  margin: 0 15px;
  position: relative;
  user-select: none;
  .label {
    color: #ccc;
    font-size: 0.5rem;
    margin-bottom: 1rem;
    text-align: center;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .knob-area {
    position: relative;
  }
  .knob-outer {
    background-color: #444;
    border-radius: 50%;

    position: relative;
  }

  .marker {
    //bottom:15%;

    left: 50%;
    position: absolute;
    transform: translateX(-50%);

    background-color: #fff;
    bottom: 0;
    height: 20%;
    width: 2px;
  }
  .ticks {
    position: absolute;
  }
  .tick {
    max-width: 3px;
    position: absolute;
    text-align: center;
    &::before {
      background-color: #555;
      bottom: 0;
      content: "";
      height: 20%;
      left: 0;
      margin: auto;
      position: absolute;
      width: inherit;
    }
    /*&.active::before {
      background-color:#a8d8f8;
      box-shadow:0 0 1px 0.05rem darken(#a8d8f8, 10%);
    }*/
    .tick-label {
      bottom: -0.9rem;
      color: #bbb;
      font-family: sans-serif;
      font-size: 0.5rem;
      left: 50%;
      position: absolute;
      text-transform: uppercase;
      transform: translateX(-50%);
    }
  }

  &:not(.wave) {
    .tick::before {
      bottom: -2px;
      height: 25%;
    }
  }
}

.knob-control {
  display: inline-block;
  margin: 0 1rem;
  position: relative;
  text-align: center;
  user-select: none;
  vertical-align: top;
  .label {
    color: #ccc;
    font-size: 0.7rem;
  }
  .control {
    background-color: #444;
    border-radius: 50%;
    box-shadow: 0 -0.2rem 0.1rem 0.05rem rgba(255, 255, 255, 0.1) inset,
      0 0.2rem 0.1rem 0.05rem rgba(0, 0, 0, 0.1) inset;
    margin-top: 20%;
    width: 100%;
    height: 100%;
  }
  .knob {
    // background-color: rebeccapurple;
    border-radius: 50%;
    position: absolute;
    &::after {
      background-color: #a8d8f8;
      border-radius: 50%;
      bottom: 10%;
      box-shadow: 0 0 0.4rem 0 darken(#a8d8f8, 10%);
      content: "";
      height: 4px;
      left: 50%;
      position: absolute;
      transform: translateX(-50%);
      width: 4px;
    }
  }
  .ticks {
    position: absolute;
  }
  .tick {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;

    &::after {
      content: "";
      background-color: #3a0f0a;
      height: 12%;
      left: 50%;
      position: absolute;
      top: -12%;
      width: 11%;

      transform: translateX(-50%);
      border-radius: 40%;
      transition: background-color 50ms ease-in;
      box-shadow: 0px 0px 3px 1px #000;
      // transform: rotate(0deg) translateX(-50%);
      // transform-origin: bottom left;
      // border: 1px solid darken(#571710, 50%);
    }
    &.active::after {
      background-color: #f23c1f;
      box-shadow: 0 0 calc(var(--size, 50px) / 50) 0.05rem darken(#f23c1f, 10%);
    }
  }
}
</style>
