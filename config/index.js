// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')
var PORT = process.env.port ? process.env.port : 8086
var PUBLIC_PATH_DEV = 'http://XXX.com'
var PUBLIC_PATH_REMOTE = 'https://XXX.com/'
const REMOTE_DIR = './yzb_static'
module.exports = {
    dev: {
        env: require('./dev.env'),
        port: PORT,
        autoOpenBrowser: true,
        assetsRoot: path.resolve(__dirname, '../'),
        assetsSubDirectory: './',
        assetsPublicPath: process.env.localhost ? '/' : PUBLIC_PATH_DEV + ':' + PORT + '/',
        proxyTable: {},
        cssSourceMap: false
    },
    build:{
        env: require('./prod.env'),
        assetsRoot: path.resolve(__dirname, '../'),
        assetsSubDirectory: process.env.REQUEST_ENV && process.env.REQUEST_ENV === 'remote' ? REMOTE_DIR : './dist',
        assetsPublicPath: process.env.REQUEST_ENV && process.env.REQUEST_ENV === 'remote' ? PUBLIC_PATH_REMOTE : '/',
        productionSourceMap: false,
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        REQUEST_ENV:process.env.REQUEST_ENV && process.env.REQUEST_ENV === 'remote' ? process.env.REQUEST_ENV : 'local',
        bundleAnalyzerReport:process.env.npm_config_report
    },
    remote_host_setting:{
        REMOTE_URL: PUBLIC_PATH_REMOTE,
        port:22,
        remote_root:'XXX',
        remote_dir:REMOTE_DIR,
        hosts:['XXXX'],
        username:'XXX',
        password:'XXX'
    }
}
