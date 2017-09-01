var gulp = require('gulp');
var scp = require('gulp-scp2');
var path = require('path')
var fs = require('fs')
var minimist = require('minimist');
const chalk = require('chalk');
var config = require('./config');
var rm = require('rimraf')
var ENV = config.remote_host_setting
var upload_arr = [], upload_dll = {}
/* 使用说明
    当前目录命令行执行
    gulp help 可以查看配置的任务
    gulp upload --src dist/css/index.4d52e99e0bb978f45b7483195ec51e96.css.map --dest css/  上传某个文件
    gulp upload --src dist/css/ --dest css/ --file css上传某个目录下的某类文件
*/
gulp.task('default', function() {
  // 将你的默认的任务代码放在这
  console.log(`
    'upload 上传单个文件': ${chalk.yellow('gulp upload --src dist/css/index.4d52e99e0bb978f45b7483195ec51e96.css.map --dest css/')}
    'upload 上传某个目录下的某类文件': ${chalk.yellow('gulp upload --src dist/css/ --dest css/ --file css')}
    'dev 开发环境 需要npm run dev 启动项目 '
    'local 本地环境 dist目录 '
    'remote 生产环境 staticwww目录 '
    ${chalk.red('warning：上传目录一次只能上传一类文件,且路径要有/')}
    `);
});

//gulp配置的命令
gulp.task('help', function() {
  console.log(`
    'upload 上传单个文件': ${chalk.yellow('gulp upload --src dist/css/index.4d52e99e0bb978f45b7483195ec51e96.css.map --dest css/')}
    'upload 上传某个目录下的某类文件': ${chalk.yellow('gulp upload --src dist/css/ --dest css/ --file css')}
    'dev 开发环境 需要npm run dev 启动项目 '
    'local 本地环境 dist目录 '
    'remote 生产环境 staticwww目录 '
    ${chalk.red('warning：上传目录一次只能上传一类文件,且路径要有/')}
    `);
});

var knownOptions = {
    string: 'dest',
    string: 'src',
    string: 'file',
    clean_dir: 'file',
    default: {dest:'',src:'',file:'', clean_dir:''}
};
var options = minimist(process.argv.slice(2), knownOptions);
var is_file = options.src && !fs.lstatSync(options.src).isDirectory();
if(!is_file && options.file || is_file){
    if(!is_file){
        if(options.src.substring(options.src.length - 1) !== '/'){
            options.src += '/'
        } 
    }
    if(options.dest.substring(options.dest.length - 1) !== '/'){
        options.dest += '/'
    }
    console.log(`
    源目录：${chalk.green(path.resolve(__dirname, options.src + '*.' + (!is_file ? '*.' + options.file : '')))}
    目标路径：${chalk.yellow(path.resolve(ENV.remote_root, ENV.remote_dir,options.dest))}
    `);
    for(let i = 0; i < ENV.hosts.length; i++){
        upload_arr.push('upload_' + ENV.hosts[i])
        gulp.task('upload_' + ENV.hosts[i], function(){
            return gulp.src(path.resolve(__dirname, options.src + (!is_file ? '*.' + options.file : '')), {cwd: __dirname})
            .pipe(scp({
                host: ENV.hosts[i],
                username: ENV.username,
                password: ENV.password,
                dest: path.resolve(ENV.remote_root, ENV.remote_dir,options.dest),//注意服务器必须已经有这么目录了
                watch: function(client) {
                  client.on('write', function(o) {
                    if(i){
                        var destination = o.destination.split('/')
                        var file_name = destination.slice(5)[0].split('.')
                        upload_dll[file_name[0]] = file_name[2]
                        console.log(chalk.green('静态资源路径：' + ENV.REMOTE_URL + destination.slice(3).join('/'))); 
                    }
                  });
                }
            })).on('error', function(err) {
                console.log(err);
            });
        })
    }
} else {
    upload_arr.push('help')
}
//上传文件，支持单个或文件夹，文件夹一次只能上传一类文件
gulp.task('upload', upload_arr, function(){
    if(upload_arr[0] !== 'help'){
        //预编译第三方库则自动替换hash
        if(options.src === 'src/assets/lib/' && Object.keys(upload_dll).length){
            console.log('远程dll的hash值',upload_dll)
            var data=fs.readFileSync(path.resolve(__dirname, '../templates/index.html'),"utf-8");
            data = data.replace(/\/[A-z]+\.dll\.([A-z]|[0-9]){6}\.js/g, function(dll_url){
                var dll_url_arr = dll_url.split('.')
                dll_url_arr[2] = upload_dll[dll_url_arr[0].substring(1)]
                return dll_url_arr.join('.')
            });
            fs.writeFile(path.join(__dirname, '../templates/index.html'), data,function(err){
                if(err){
                    console.log('写文件操作失败,手动修改src/views/index.html文件的dll的哈希值');
                } else {
                    console.log(chalk.green('src/views/index.html的dll文件hash值修改完成')); 
                }
            });
        }
    } else {
        console.log(chalk.red('gulp参数有误，请参考上述help文档改正'));
    }
})


var switchENV = function(env){
    // switch env
    var filepath = path.resolve(__dirname, "../longtail/settings.py");
    var code = fs.readFileSync(filepath,'utf-8');
    var env_vars = {
      "dev": {
        'env': "dev",
        'url': config.dev.assetsPublicPath,
        'dir': '../static/'
      },
      "local": {
        'env': "local",
        'url': './',
        'watermark': '本地测试'
      },
      "remote":  {
        'env': "remote",
        'url': ENV.REMOTE_URL,
        'watermark': '远程测试'
      },
    }
    code = code.replace(/STATIC_ENV\s*=\s*'(?:dev|local|remote)'/, "STATIC_ENV = '" + env_vars[env].env + "'");
    code = code.replace(/STATIC_URL\s*=\s*'[\w\-\/\.:]+'/, "STATIC_URL = '" + env_vars[env].url + "'");
    if(env_vars[env].dir){
      code = code.replace(/STATICFILES_DIRS\s*=\s*\(\s+os\.path\.join\(curr_path,\s*'[\w\-\/\.]+'\)/, "STATICFILES_DIRS = (\n\tos.path.join(curr_path, '" + env_vars[env].dir + "')");
    }
    fs.writeFile(filepath,code)
    // add water mark to indicate test env
    var layoutTpl = path.resolve(__dirname, '../templates/index.html'); 
    var WATERMARK = '<div style="position:fixed;top:0;left:0;z-index:99999;width:100px;height:30px;color:#fff;background-color:rgba(4, 79, 239, 0.3);font-size:18px;text-align:center">ENV</div>';
    code = fs.readFileSync(layoutTpl,'utf-8');//grunt.file.read(layoutTpl);
    code = code.replace(new RegExp(WATERMARK.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace('ENV', '[^<]+'), 'g') , '');
    if(env_vars[env].watermark){
      code = code.replace('</body>', WATERMARK.replace('ENV', env_vars[env].watermark) + '</body>');
    }
    fs.writeFile(layoutTpl,code)
    console.log(chalk.green('Now static environment is: ' + env))
}

gulp.task("dev", function(env) {
    switchENV('dev')
})
gulp.task("local", function(env) {
    switchENV('local')
})
gulp.task("remote", function(env) {
    switchENV('remote')
})

gulp.task('clean', function(){
    rm(path.join(config.build.assetsRoot, './dist'), err => {
        if (err) throw err
        console.log(chalk.red(config.build.assetsSubDirectory + '删除完成'));
    })
    rm(path.join(config.build.assetsRoot, ENV.remote_dir), err => {
        if (err) throw err
        console.log(chalk.red(ENV.remote_dir + '删除完成'));
    })
})
gulp.task('clean-local', function(){
    rm(path.join(config.build.assetsRoot, './dist'), err => {
        if (err) throw err
        console.log(chalk.red(config.build.assetsSubDirectory + '删除完成'));
    })
})
gulp.task('clean-remote', function(){
    rm(path.join(config.build.assetsRoot, ENV.remote_dir), err => {
        if (err) throw err
        console.log(chalk.red(ENV.remote_dir + '删除完成'));
    })
})