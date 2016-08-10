/**
 * mock数据的服务，用以模拟后端java的接口
 * 开发调试时候用
 * @type {Application}
 * 备注：
 *     用以mock数据的json文件，在命名以及文件夹目录，规则遵循如下
 *     app/middleware/proxy/rules.js中的key的值
 *
 *      request               =>     json-file
 *     'GET /upload/image'  对应=>   app/mock/data/ + get/upload/image.json
 *
 */
"use strict";
var path = require('path'),
    fs = require('fs'),
    koa = require('koa'),
    app = koa(),
    config = require('config'),
    port = config.get('remoteServer').port,
    _ = require("underscore"),
    colors = require("colors");

console.log(colors.green(`\r\nStart local mock-server on "http://127.0.0.1:${port}"\r\n`));

// config
app.use(function *(next){
    var url = `${this.method.toUpperCase()} ${this.path}`,
        filePath = `/${this.method.toLowerCase()}${this.path}`;
    if(filePath.substr(-1) == '/'){
        filePath += 'index.json';
    }else{
        filePath += filePath.substr(-5)!='.json'?'.json':'';
    }
    // print out
    console.log(colors.cyan(`-  MockUrl: ${url}\r\n`)
              + colors.cyan(`- MockFile: /app/mock/data${filePath}`));
    var custom = null;
    // get data via *.json file
    var common = JSON.parse(fs.readFileSync(__dirname + '/data/common.json', 'utf8'));
    try{
        custom = JSON.parse(fs.readFileSync(__dirname + '/data'+filePath, 'utf8'));
    }catch(e){
        custom = false;
        console.log(colors.red("MockError:\r\n",e.message));
    }
    if(url=="POST /uploadimg"){//模拟图片上传
        this.status = 200;
        this.type = 'text/html';//这里特殊处理是为了兼容ie，（传图nos，浏览器为ie时，在application/json时候，会让用户去下载json文件）
        if(!!custom){
            var str = JSON.stringify(custom);
            str = str.replace(/"(\w+)"(\s*:\s*)/g, "$1$2");//将json中的引号转义一下
            this.body = str;
        }else{
            this.body = "{ code: 200, message: 'OK',url:'https://avatars3.githubusercontent.com/u/4298621?v=3&s=40'}";
        }
    }else{
        if(!!custom){
            // this.status = 200;
            this.type = 'json';
            this.body = _.extend({},common,custom);
        }else{
            this.status = 404;
            this.type = 'text/html';
            this.body = `404 file not found: mock-data(${filePath}) is not found`;
        }
    }

    // 这里，更改 this.status, this.body, this.type, 去模拟接口的其他情况: 401,402,403,404,500

});

// start server
app.listen(port);
