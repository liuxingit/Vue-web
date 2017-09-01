const path = require('path')
const webpack = require('webpack')
const os = require('os')
const UglifyJsparallelPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  entry: {
    vendor:['vue','vue-router','vuex','axios','highcharts','echarts','moment','element-ui']
  },
  output: {
    path: path.join(__dirname, '../src/assets/lib/'),
    filename: '[name].dll.[chunkhash:6].js',
    library: '[name]_library_[chunkhash:6]'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  plugins: [
      new webpack.DllPlugin({
          path: './src/assets/lib/[name]-manifest.json',
          //The manifest is very important, it gives other Webpack configurations 
          //a map to your already built modules. Path represent where to generate manifest file
          name: "[name]_library_[chunkhash:6]",
          context: __dirname,
          // the name is the name of the entry
          //context: path.resolve(__dirname, "client")
          // context of requests in the manifest file, defaults to the webpack context
      }),
      new webpack.HashedModuleIdsPlugin(),//生成标识符规则
      // new webpack.optimize.OccurenceOrderPlugin(),
      // webpack2 has already built-in
      new UglifyJsparallelPlugin({
          workerCount: os.cpus().length,
          uglifyJS: {
              // 可以用uglifyJS自身的配置
              // 这里用于支持低版本IE
              compress: {
                  warnings: false,
                  drop_debugger: true,
                  drop_console: true
              },
              sourceMap: false
          }
      })
  ],
}
