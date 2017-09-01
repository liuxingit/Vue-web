var path = require('path')
var os = require('os')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const AssetsPlugin = require('hash-assets-webpack-plugin');
// var WebpackChunkHash = require("webpack-chunk-hash");
// var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin");
const UglifyJsparallelPlugin = require('webpack-parallel-uglify-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//var env = config.build.env
var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: false,
})
webpackConfig.plugins.push(// extract css into its own file
    new webpack.DefinePlugin({
      'process.env': config.build.env
    }),
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name]' + (process.env.NODE_ENV === 'production' && config.build.REQUEST_ENV === 'remote' ? '_[contenthash:7]' : '') + '.css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // new webpack.HashedModuleIdsPlugin(),//生成标识符规则
    // new WebpackChunkHash(),//默认md5,文件hash值基于文件内容
    // new ChunkManifestPlugin({//导出构建信息的json文件
    //     filename: "chunk-manifest.json",
    //     manifestVariable: "webpackManifest",
    //     inlineManifest: true
    // })
    new webpack.DllReferencePlugin({//预编译第三方库
      context: __dirname,
      manifest: require('../src/assets/lib/vendor-manifest.json')
    })
)
if(config.build.REQUEST_ENV === 'remote'){
  webpackConfig.output = {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name]_[chunkhash:7].js'),
    chunkFilename: utils.assetsPath('js/[name]_[chunkhash:7].js'),//hash和chunkhash的区别，前者所有文件统一hash值，后者各自有个hash值
    publicPath:config.build.assetsPublicPath
  }
  webpackConfig.plugins.push(// extract css into its own file
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
      }),
      new AssetsPlugin({
          hash:true,
          path:config.build.assetsSubDirectory,
          keyTemplate:function(filename){
            var match = /(js|css|images|media)\/([\w\-\.]+)_(\w{7})\.\1/.exec(filename);
            return [match[1] + '/' + match[2] + '.' + match[1],match[3]];
          },
          assetNameTemplate:'[name]_[hash]',
          //hashLength:7,
          prettyPrint: true
          //srcPath: './src',
          // srcMatch: {
          //     'home.tpl': /['"]([^'"]+\.(?:png|jpg))['"]/gi
          // },
          // assetMatch: {
          //     css: /\(['"]?([^\(\)]+\.(?:gif|png|jpg))['"]?\)/gi
          // },
          // assetNameTemplate: '[name].[hash]',
      })
  )
} else {
    webpackConfig.output = {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].js'),
        chunkFilename: utils.assetsPath('js/[name].js'),//hash和chunkhash的区别，前者所有文件统一hash值，后者各自有个hash值
        publicPath:config.build.assetsPublicPath
    }
}
if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
