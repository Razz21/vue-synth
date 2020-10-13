<template>
  <div>
    <canvas ref="analyser" :style="style" style="background-color: #eee;"></canvas>
    <p>
      <input type="range" v-model="threshold" min="-1" max="1" step="0.01" />
      {{ threshold }}
    </p>
  </div>
</template>

<script>
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P
      ? value
      : new P(function(resolve) {
          resolve(value);
        });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
import WavePacket from "@/utils/WavePacket";
// import { scale } from "@/utils";
function scale(v, inMin, inMax, outMin, outMax) {
  return ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
export default {
  props: {
    signal: null,
    width: {
      type: [Number, String],
      default: "300px"
    },
    height: {
      type: [Number, String],
      default: "100px"
    }
  },
  data() {
    return {
      threshold: 0.4,
      normalizeCurve: true,
      timeout: null
    };
  },
  computed: {
    style() {
      return { width: this.width, height: this.height };
    }
  },
  methods: {
    draw(values) {
      const canvas = this.$refs.analyser;
      if (canvas) {
        const context = canvas.getContext("2d");
        // ----
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        context.canvas.width = width;
        context.canvas.height = height;
        // ----

        context.clearRect(0, 0, width, height);
        const maxValuesLength = 2048;
        if (values.length > maxValuesLength) {
          const resampled = new Float32Array(maxValuesLength);
          // down sample to maxValuesLength values
          for (let i = 0; i < maxValuesLength; i++) {
            resampled[i] = values[Math.floor((i / maxValuesLength) * values.length)];
          }
          values = resampled;
        }
        const max = this.normalizeCurve ? Math.max(0.001, ...values) * 1.1 : 1;
        const min = this.normalizeCurve ? Math.min(-0.001, ...values) * 1.1 : 0;
        const lineWidth = 3;
        context.lineWidth = lineWidth;
        context.beginPath();
        for (let i = 0; i < values.length; i++) {
          const v = values[i];
          const x = scale(i, 0, values.length, lineWidth, width - lineWidth);
          const y = scale(v, max, min, 0, height - lineWidth);
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.lineCap = "round";
        context.strokeStyle = "#ff0000";
        context.stroke();
      }
    },
    generate() {
      return __awaiter(this, 0, 0, function*() {
        if (!this.signal) return;
        const values = yield this.signal.asArray(600);
        this.draw(values);
      });
    }
  },
  mounted() {
    /* ========= analyser ========== */
    const loop = async () => {
      requestAnimationFrame(loop);
      if (!this.signal) return;
      //get the waveform valeus and draw it
      const values = await this.signal.asArray(200);
      // const values = this.signal.getValue();
      // console.log(values);
      // drawScope(values);
      this.draw(values);
    };
    // loop();

    // setInterval(() => {
    //   console.log("interval");
    //   this.generate();
    // }, 3000);
  },
  created() {
    const handler = () => {
      clearInterval(this.timeout);
      this.timeout = setTimeout(() => {
        this.generate();
      }, 50);
    };
    this.$root.$on("update:analyzer", handler);
    this.$once("hook:beforeDestroy", () => this.$root.$off("update:analyzer", handler));
  },
  updated() {
    // clearTimeout(this.timeout);
    // this.timeout = setTimeout(() => {
    //   console.log("gen");
    //   this.generate();
    // }, 50);
  }
};
</script>

<style lang="scss"></style>
