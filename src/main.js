import Vue from "vue";
import App from "./App.vue";
import store from "./store";

/*
===========================
>>> Globally register all components from 'src/components/global' directory
===========================
*/
const files = require.context("@/components/global", false, /\.vue$/i);

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

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
