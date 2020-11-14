const path = require("path");
module.exports = {
  assetsDir: "src/assets/",
  // sass-node config with vue-cli-4
  // https://stackoverflow.com/a/59537228/10922608
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/scss/global.scss";`
      }
    }
  },
  configureWebpack: {
    devtool: "source-map"
  },
  chainWebpack: config => {
    config.module
      .rule("sass")
      .test(/\.sass$/)
      .use("vue-loader")
      .loader("sass-loader")
      .end();

    config.resolve.alias.set("@scss", path.resolve(__dirname, "src/assets/scss"));
  }
};
