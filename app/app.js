/**
 * main
 * @type {Application}
 * @description
 *    请勿更改每个koa-middleware的use调用顺序！
 */
'use strict';
var koa = require('koa'),
    config = require('config'),
    http = require('http'),
    fs = require("fs"),
    path = require("path"),
    swig = require('koa-swig'),
    views = require('koa-views'),
    bodyparser = require('koa-bodyparser'),
    koastatic = require('koa-static'),
    session = require('koa-session'),
    oidAuth= require('./middleware/auth/auth'),
    gzip = require('koa-gzip'),
    json = require('koa-json'),
    mount = require('koa-mount'),
    proxy = require("./middleware/proxy/proxy"),
    proxyRules = require("./middleware/proxy/rules/rules"),
    proxyWhiteRules = require("./middleware/proxy/rules/whiteRules"),
    dealUnProxyRules = require("./middleware/proxy/dealUnProxy"),
    afterProxy = require("./middleware/proxy/afterProxy"),
    JsonError = require('./common/error').JsonError,
    logger = require("./common/logger"),
    colors = require("colors"),
    favicon = require('koa-favicon');

/**
 * common tool
 */
var NOOP = function(){return arguments;};
// Notifier
var isDev = (process.env.NODE_ENV=="development"),
    notifier = require("./common/notifier"),
    doNotify = isDev ? notifier : NOOP;
// // colors
// var prodColors = {},
//     cProps = ["red","green","yellow","cyan","magenta","gray","grey"];
// for(var cpI=0;cpI<cProps.length;cpI++){
//     prodColors[cProps[cpI]] = NOOP;
// }
// var _colors = require("colors"),
//     colors = isDev ? _colors : prodColors;

// 创建放图片的临时目录
var tmpDir = 'tmp';
if (!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
}
// 创建日志目录
var logDir = 'logs';
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}


/**
 * app configuration
 */
var app = koa(),
    env = app.env;


// koa-gzip always be the last middleware
app.use(gzip());

// koa-json default to be disabled (using in production)
app.use(json());//default
// app.use(json({ pretty: false, param: 'pretty' }));// 手动开启，不推荐！

// koa-session
app.keys = ['kaola key'];
app.use(session(app));
// auth
app.use(oidAuth());



// Config static file server
/*
 * 请勿随意更改，这里路径命名与webpack设置相配合！！！
 */
var staticPath = config.get('staticPath');
// fonts & images & other => '/res',
app.use(mount('/res', koastatic(__dirname +"/../app/public"+ staticPath + '/res')));
// js & css & sourcemap
app.use(mount('/js', koastatic(__dirname +"/../app/public"+ staticPath + '/js')));
app.use(mount('/css', koastatic(__dirname +"/../app/public"+ staticPath + '/css')));
app.use(mount('/sourcemap', koastatic(__dirname +"/../app/public"+ staticPath + '/sourcemap')));
// third-part
app.use(mount('/lib', koastatic(__dirname +"/../app/public/thirdpart")));
// favicon.ico
app.use(favicon(path.join(__dirname, '/../app/public', 'favicon.ico')));



// Views(*.html via swig)
var viewPath = config.get('viewsPath');
app.use(views(__dirname + viewPath, {
    map:{
        html: 'swig'
    },
    cache:env == 'dev'?false:'memory'//,  //nocache-when-development
}));



// Config after proxy
app.use(afterProxy({
    rules: proxyRules,
    whiteRules: proxyWhiteRules
}));//afterProxy should be used (app.use()) before proxy



// Error logger
app.use(function* (next){
    var start = new Date();
    try{
        yield* next;
        logger.info('%s %s - %s %sms', this.method, this.url, this.status, new Date - start);
        // console.log(`Logger-watch: status = ${this.status}`);
    }catch(e){
        var status = e.status  || 500;
        var message= e.message || '服务器错误';
        logger.error('%s %s - %s %sms | %s', this.method, this.url, status, new Date - start, message);
        // 错误是 json 错误
        if(e.name == 'JsonError' ) {
            this.body = {
                'status': status,
                'message': message
            };
            if(status == 500) {
                this.app.emit('error', e, this);// 触发 koa 统一错误事件，可以打印出详细的错误堆栈 log
            }
            return;
        }
        // Error 根据 status 渲染不同的页面
        this.status = status;
        switch(status){
            case 401:
            case 402:
            case 403:
            case 404:
            case 500: {
                yield this.render(`common/error/${status}`, {
                    'err': {
                        status:e.status,
                        statusCode:e.statusCode,
                        expose:e.expose,
                        detailInfo:e.toString(),
                        message:e.message
                    }
                });
                this.app.emit('error', e, this);
                break;
            }
            default: {
                yield this.render('common/error/other', {
                    'err': {
                        status:e.status,
                        statusCode:e.statusCode,
                        expose:e.expose,
                        detailInfo:e.toString(),
                        message:e.message
                    }
                });
                this.app.emit('error', e, this);
                break;
            }
        }
        //
    }
});



// Config body-parser
app.use(bodyparser({ formLimit:'5mb' }));



// Normal http handle
app.use(function *(next){
    yield next;
    // console.log(`Http-watch  : status = ${this.status}`);
    if (this.status != 200) {
        this.throw(this.status);//将非200的视为异常并主动扔出
    }
});



// deal un proxy rules (the white rules)
app.use(dealUnProxyRules({
    whiteRules: proxyWhiteRules //白名单
}));



// Config proxy to java-server
var rmtServerConfig = config.get('remoteServer'),
    remoteServerUrl = `${rmtServerConfig.host}:${rmtServerConfig.port}`;
app.use(proxy({
    proxyOptions: {
        target: remoteServerUrl
    },
    whiteRules: proxyWhiteRules //白名单内不代理
}));





// print out configuration info
console.log("\r\nApp Configuration:");
console.log("             koa-env = "+colors.yellow(env));
console.log("process.env.NODE_ENV = "+colors.yellow(process.env.NODE_ENV));
console.log("          staticPath = "+colors.yellow("app/public"+staticPath));
console.log("            viewPath = "+colors.yellow("app"+viewPath));
console.log("        RemoteServer = "+colors.yellow(remoteServerUrl)+"\r\n");



/**
 * server configuration
 */
var server = http.createServer(app.callback());
var port = config.port || 8888;

// watch-error
server.on('error', function (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            logger.error(`${bind} requires elevated privileges`);
            doNotify("app.js",bind + "端口权限不够！", 0, 1);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            logger.error(`${bind} is already in use`);
            doNotify("app.js",bind + "端口占用中！", 0, 1);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

// watch-listening
server.on('listening', function () {
    var addr = server.address();
    var bind = typeof addr === 'string' ? ('pipe ' + addr ) : ('port ' + addr.port);
    console.log(colors.green(`Start server on ${bind} success!\r\n`));
    doNotify("app.js",`Start server on ${bind}`);
});

// start-server
server.listen(port);