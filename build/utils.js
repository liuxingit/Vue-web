var path = require('path')
var config = require('../config')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
//https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/master/README.md

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production' ? config.build.assetsSubDirectory : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {//loading的选项配置
      minimize: process.env.NODE_ENV === 'production',//远程压缩文件
      sourceMap: options.sourceMap//根据参数是否生成sourceMap文件
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {//生成loader
    var loaders = [cssLoader]//默认cssloader
    if (loader) {//如果参数 loader存在
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {//将loaderOptions和sourceMap组成一个对象
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {// 如果传入的options存在extract且为true
      return ExtractTextPlugin.extract({//ExtractTextPlugin分离js中引入的css文件
        use: loaders,//处理的loader
        fallback: 'vue-style-loader' //没有被提取分离时使用的loader
      })
    } else {//返回css类型对应的loader组成的对象 generateLoaders()来生成loader
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
