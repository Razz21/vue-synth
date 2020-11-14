<template>
  <div class="meter">
    <div
      class="meter-channel"
      :style="{ '--level': level }"
      v-for="(level, idx) in meterLevels"
      :key="idx"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    meter: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      meterLevels: []
    };
  },
  mounted() {
    const loop = () => {
      requestAnimationFrame(loop);
      if (!this.meter) {
        return;
      }
      const values = this.meter.getValue();
      const levels = values.map(val => val.toFixed(2));
      this.meterLevels = levels;
    };
    loop();
  }
};
</script>

<style lang="scss">
.meter {
  display: flex;
  height: 100%;
  &-channel {
    width: 1em;
    margin: 0.1em;
    flex: 1;
    overflow: hidden;
    background: linear-gradient(to bottom, red 5%, orange 20%, green 60%);
    box-shadow: inset 0 0 2px 0 #333, inset 0 0 1px 3px #000, 0 0 2px 1px #252525, 0 0 2px 1px #111;
    &::before {
      content: "";
      background: #111;
      position: absolute;
      width: 100%;
      height: 100%;
      transform-origin: center top;
      transform: scaleY(calc(1 - var(--level, 0)));
    }
  }
}
</style>
