import Vue from "vue";
import App from "./App.vue";

/*
===========================
>>> Globally register all components from 'src/components/global' directory
===========================
*/
const files = require.context("@/components/global", true, /\.vue$/i);

files.keys().map(key => {
  Vue.component(
    files(key).default.name ??
      key
        .split("/")
        .pop()
        .split(".")[0],
    files(key).default
  );
});
/*
===========================
*/

Vue.config.productionTip = false;

Vue.prototype.$bus = new Vue();

new Vue({
  render: h => h(App)
}).$mount("#app");
