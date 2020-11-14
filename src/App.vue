<template>
  <div id="app">
    <div class="flex m-auto" style="z-index:5">
      <Synthesizer />
    </div>
  </div>
</template>

<script>
import Synthesizer from "@/components/Synthesizer";
export default {
  name: "App",
  components: { Synthesizer }
};
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
</style>
