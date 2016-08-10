/**
 * 代理转发请求到back-end服务
 */
"use strict";
const ServerResponse = require('http').ServerResponse,
      httpProxy = require('http-proxy');
/**
 * 配置代理
 * @param options 配置项
 *        options.target 代理服务所在的地址，url，eg：http://localhost:8080
 * @returns {Function}
 */
module.exports = function(options) {
    var proxy;
    if (typeof options == 'string') {
        options = { target: options };
    }
    // config proxy
    proxy = httpProxy.createProxyServer(options);
    proxy.on('end', function(req, res, proxyRes){
        res.emit('proxyEnd', req, res, proxyRes);
    });
    proxy.on('error', function(e){
        console.error(JSON.stringify(e,null,2));
    });

    return function *(next) {
        var _url = `${this.method.toUpperCase()} ${this.url}`;

        var isInWhiteList = false;
        // isInWhiteList = _url=="GET /upload/image";
        if(isInWhiteList){
            // 白名单需要跳过代理
            console.log(`Skip-Proxy!! url = ${_url} , because the rule is in white-list!`);
        }else{
            // 不在白名单的均采用代理
            console.log(`Start-Proxy, url = ${_url}`);
            var ctx = this,
                res = new ServerResponse(ctx.req);
            // overwrite the respopnse body
            var bodyBuffers = [];
            res.write = function(chunk){
                bodyBuffers.push(chunk);
                return true;
            };
            // yield to a thunk
            try{
                yield function(callback) {
                    proxy.web(ctx.req, res, callback);
                    res.once('proxyEnd', function(req, res, proxyRes){
                        res.body = Buffer.concat(bodyBuffers);
                        callback(null, proxyRes);
                    });
                };
            }catch(e){
                console.log( "Proxy Failed !:\r\nThunkError:\r\n",JSON.stringify(e,null,2) );
            }
            // status
            this.status = res.statusCode;
            // headers
            for (let name in res._headers) {
                this.set(name, res._headers[name]);
            }
            // body
            this.body = res.body;
            res = null;
        }

    };
};
