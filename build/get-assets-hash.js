/* 使用asset-hash.json文件替换html中的哈希值*/
var fs = require('fs')
var path = require('path')
var config = require('../config')
if(process.env.NODE_ENV === 'production' && process.env.REQUEST_ENV === 'remote'){
    var result=JSON.parse(fs.readFileSync( path.resolve(__dirname, '../', config.build.assetsSubDirectory + '/assets-hash.json')))
    var filepath = path.resolve(__dirname, "../../templates/index.html");
    var code = fs.readFileSync(filepath,'utf-8');
    for(let file_name in result){
      var reg = new RegExp("\\$\\{staticUrl\\(\\'" + file_name + "\\'\\,\\\s*\\'[0-9|A-z]{0,7}\\'\\)\\}")
      code = code.replace(reg, function(word){
        return "${staticUrl('" + file_name + "', '" + result[file_name] + "')}"
      });
    }
    fs.writeFile(filepath,code)
}