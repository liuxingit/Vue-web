require('./check-versions')()

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.dev.conf')//区分不同的环境process.env.NODE_ENV
var WebpackDevServer = require('webpack-dev-server');
process.env.NODE_ENV = 'development'
//默认端扣8080，地址devstatic.maimiaotech.com
webpackConfig.entry.index.unshift("webpack-dev-server/client?" + config.dev.assetsPublicPath);
var compiler = webpack(webpackConfig);
var server = new WebpackDevServer(compiler,{
	hot:true,
	disableHostCheck:true,
	stats:{
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false
	}
});
console.log(chalk.green('  Listen ' + (process.env.localhost ? 'localhost:' + config.dev.port : config.dev.assetsPublicPath) + ' \n'))
server.listen(config.dev,config.dev.assetsPublicPath.split(':' + config.dev.port)[0],function() {
	// body...
});
