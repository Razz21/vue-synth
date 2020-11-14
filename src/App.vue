<template>
  <div id="app">
    <div style="z-index:3; position:absolute;top:0;left:0">
      <button @click="dumpPreset">Dump Preset</button>
      <button @click="panic">Panic</button>
      <button @click="toggleAnalyser">wave</button>
    </div>
    <div class="flex m-auto" style="z-index:5">
      <Synthesizer ref="synth" v-show="loaded" />
    </div>
  </div>
</template>

<script>
import Synthesizer from "@/components/Synthesizer";
export default {
  name: "App",
  components: { Synthesizer },
  data() {
    return {
      loaded: false
    };
  },
  methods: {
    dumpPreset() {
      this.$refs.synth.dumpPreset();
    },
    async panic() {
      this.$refs.synth.panic();
    },
    toggleAnalyser() {
      this.$refs.synth.toggleAnalyser();
    }
  },
  mounted() {
    window.addEventListener("load", () => {
      this.$nextTick(() => {
        this.loaded = true;
      });
      console.log("app loaded");
    });
  }
};
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
</style>
