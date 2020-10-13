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
import WavePacket from "@/utils/WavePacket";
export default {
  props: {
    signal: null,
    width: {
      type: [Number, String],
      default: "80px"
    },
    height: {
      type: [Number, String],
      default: "50px"
    }
  },
  data() {
    return {
      threshold: 0.4
    };
  },
  computed: {
    style() {
      return { width: this.width, height: this.height };
    }
  },
  mounted() {
    /* ========= analyser ========== */
    let canvasWidth, canvasHeight;

    const waveCanvas = this.$refs.analyser;
    const ctx = waveCanvas.getContext("2d");

    const drawScope = values => {
      const scaling = canvasHeight / 2;
      let risingEdge = 0;
      const threshold = 0;
      values = WavePacket.downsample(values, 160);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "rgb(3, 18, 3)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(0, 200, 0)";
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgb(0, 255, 0)";

      ctx.beginPath();

      while (values[risingEdge++] > this.threshold && risingEdge <= canvasWidth);
      if (risingEdge >= canvasWidth) risingEdge = 0;

      while (values[risingEdge++] <= this.threshold && risingEdge <= canvasWidth);
      if (risingEdge >= canvasWidth) risingEdge = 0;

      for (let x = risingEdge; x < values.length && x - risingEdge < canvasWidth; x++)
        ctx.lineTo(x - risingEdge, scaling - values[x] * scaling);

      ctx.stroke();
    };

    //size the canvases
    function setup() {
      canvasWidth = waveCanvas.offsetWidth;
      canvasHeight = waveCanvas.offsetHeight;
      ctx.canvas.width = canvasWidth;
      ctx.canvas.height = canvasHeight;
    }
    const loop = () => {
      //get the waveform valeus and draw it
      const waveformValues = this.signal.getValue();
      drawScope(waveformValues);
      requestAnimationFrame(loop);
    };

    setup();
    loop();
  }
};
</script>

<style lang="scss"></style>
