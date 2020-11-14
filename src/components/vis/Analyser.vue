<template>
  <div class="analyser">
    <canvas ref="scope"></canvas>
  </div>
</template>

<script>
export default {
  props: {
    analyser: {
      type: Object,
      required: true
    }
  },

  mounted() {
    let canvasWidth, canvasHeight, scaling, rAF;

    const waveCanvas = this.$refs.scope,
      ctx = waveCanvas.getContext("2d"),
      edgeThreshold = 5;

    function draw(analyser, ctx) {
      const timeData = new Uint8Array(analyser.frequencyBinCount);
      let risingEdge = 0,
        x;

      analyser.getByteTimeDomainData(timeData);

      // ctx.fillStyle = "rgb(0, 20, 0)";
      // ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgb(8, 255, 165)";

      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgb(0, 255, 0)";

      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.beginPath();

      // No buffer overrun protection
      while (timeData[risingEdge++] - 128 > 0 && risingEdge <= canvasWidth);
      if (risingEdge >= canvasWidth) risingEdge = 0;

      while (timeData[risingEdge++] - 128 < edgeThreshold && risingEdge <= canvasWidth);
      if (risingEdge >= canvasWidth) risingEdge = 0;

      for (x = risingEdge; x < timeData.length && x - risingEdge < canvasWidth; x++)
        ctx.lineTo(x - risingEdge, canvasHeight - timeData[x] * scaling);

      ctx.stroke();
    }

    function startAnim() {
      if (!rAF) {
        rAF = requestAnimationFrame(loopRaF);
      }
    }
    function stopAnim() {
      if (rAF) {
        cancelAnimationFrame(rAF);
        rAF = undefined;
      }
    }

    function setupAnalyzer() {
      var rect = waveCanvas.parentNode.getBoundingClientRect();
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      ctx.canvas.width = canvasWidth;
      ctx.canvas.height = canvasHeight;
      scaling = canvasHeight / 256;
    }
    const loopRaF = () => {
      rAF = undefined;
      draw(this.analyser._analyser._analysers[0], ctx);
      startAnim();
    };

    setupAnalyzer();
    startAnim();

    window.addEventListener("resize", setupAnalyzer);

    this.$once("hook:destroyed", () => {
      window.removeEventListener("resize", setupAnalyzer);
      stopAnim();
    });
  }
};
</script>

<style lang="scss">
/* canvas */
.analyser {
  z-index: 1;
  transition: opacity 0.5s ease-in-out;
  height: 120px;
  width: 400px;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  // reduce canvas repaint background events
  background-color: rgb(0, 20, 0);
  &::after {
    content: "";
    position: absolute;
    width: inherit;
    height: inherit;
    background: radial-gradient(ellipse at center, rgba(0, 255, 0, 0.48), transparent),
      repeating-linear-gradient(transparent 0, rgba(0, 0, 0, 0.2) 3px, transparent 6px);
    background-blend-mode: overlay;
    z-index: 1;
    left: 0;
  }
}
</style>
