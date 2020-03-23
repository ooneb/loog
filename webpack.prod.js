const path = require('path')
const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const common = require('./webpack.config.js')

const BUILD_DIR = path.resolve(__dirname, 'dist/')
const BUILD_FILE = 'loog.min.js'

module.exports = merge(common, {
  // mode: 'production',
  output: {
    path: BUILD_DIR,
    filename: BUILD_FILE,
    library: 'Loog',
    libraryTarget: 'window',
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false,
          },
        },
      }),
    ],
  },
})
