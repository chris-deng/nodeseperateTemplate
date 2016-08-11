/**
 * 代理转发请求到back-end服务
 * 备注：这里代理的是除开‘白名单之外的所有请求’，包含但不仅限于rules.js里面的部分
 */

"use strict";
const ServerResponse = require('http').ServerResponse,
      httpProxy = require('http-proxy'),
      util = require("./utils"),
      debug = require('debug')('app:proxy');

/**
 * 配置代理
 * @param options 配置项
 *        options.proxyParams.target 代理服务所在的地址，url，eg：http://localhost:8080
 * @returns {Function}
 */
module.exports = function(options) {
    var proxy;
    options = options || {};
    var proxyOpts = options.proxyOptions || { target:"http://127.0.0.1:3333"},// proxy options
        whiteRules = options.whiteRules || {};

    // rules白名单
    var whiteRulesMaps = util.splitRules(whiteRules),
        whiteStrRulesMap = whiteRulesMaps[0],
        whiteRegexRulesMap = whiteRulesMaps[1];

    // config proxy
    proxy = httpProxy.createProxyServer(proxyOpts);
    proxy.on('end', function(req, res, proxyRes){
        res.emit('proxyEnd', req, res, proxyRes);
    });
    proxy.on('error', function(e){
        console.error(JSON.stringify(e,null,2));
    });

    return function *(next) {

        var reqUrl = `${this.method.toUpperCase()} ${this.url}`;//格式请勿更改，method和url之间有且只有一个空格

        // debug(reqUrl);

        // 先判断是否在白名单里
        var isInWhiteList = util.checkMatchRules(reqUrl,whiteStrRulesMap,whiteRegexRulesMap).isMatch;

        if(isInWhiteList){
            // 白名单需要跳过代理
            console.log(`\r\n~<Skip>~ Proxy!! url = "${reqUrl}" , because the rule is in white-list!`);

        }else{

            // 不在白名单的均采用代理
            console.log(`\r\nStart-Proxy : url = "${reqUrl}"`);
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
        //
    };
};
