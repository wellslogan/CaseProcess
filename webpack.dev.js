const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  devServer: {
    contentBase: "./dist",
    port: 9000,
    historyApiFallback: true
  },

  devtool: "inline-source-map",

  mode: "development"
});
