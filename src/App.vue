<template>
  <div id="app">
    <control v-model="val"></control>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      val: 0
    };
  }
};
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  position: relative;
}
body {
  -webkit-transition: 0s;
  transition: 0s;
  background-color: #181b1c;
  font-family: monospace;
  color: #e4e8ea;
  font-size: 16px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
