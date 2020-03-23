const path = require('path')

const BUILD_DIR = path.resolve(__dirname, 'dist/')
const SOURCE_DIR = path.resolve(__dirname, 'src/')
const SOURCE_FILE = 'loog.mjs'
const BUILD_FILE = 'loog.js'

module.exports = {
  mode: 'development',
  entry: path.join(SOURCE_DIR, SOURCE_FILE),
  output: {
    path: BUILD_DIR,
    filename: BUILD_FILE,
    library: 'Loog',
    libraryExport: 'default',
    libraryTarget: 'window',
    // umdNamedDefine: true,
  },

  devtool: 'eval-source-map',
  resolve: {
    modules: [SOURCE_DIR, path.resolve(__dirname, './node_modules')],
    extensions: ['.js', '.mjs'],
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js)$/,
        include: SOURCE_DIR,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
}
