/**
 * 代理结束后，寻找对应模板进行渲染
 */

"use strict";
var debug = require('debug')('app:proxy'),
    util = require("./utils");

// exports
module.exports = function(options){
    options = options || { rules:null, whiteRules:null };

    // rules
    var ruleMaps = util.splitRules(options.rules || {}),
        stringRulesMap = ruleMaps[0],
        regexRulesMap = ruleMaps[1];
    // rules白名单
    var whiteRulesMaps = util.splitRules(options.whiteRules || {}),
        whiteStrRulesMap = whiteRulesMaps[0],
        whiteRegexRulesMap = whiteRulesMaps[1];

    return function *(next){
        var key = `${this.method.toUpperCase()} ${this.path}`;

        debug(key);

        yield next;

        //by default remove the content-length
        if(this.response.get('transfer-encoding') == 'chunked'){
            this.remove('content-length');
        }
        if(!this.accepts('html')){
            return;
        }
        if(this.status != 200){
            return;
        }

        // 白名单检查
        var checkWhiteRules = util.checkMatchRules(key,whiteStrRulesMap,whiteRegexRulesMap);

        if(checkWhiteRules.isMatch){
            // 白名单内规则不做 "代理后的处理"
            console.log(`~<Skip>~ After-Proxy!! url = "${key}",bacause rules is in white-list`);
        }else{
            // 查找渲染模板文件：同步页面接口-有模板，异步数据接口-无模板
            var checkRules = util.checkMatchRules(key,stringRulesMap,regexRulesMap),
                tpl = checkRules.value;
            console.log(`After-proxy : url = '${key}'`);
            // 同步数据接口
            if(!!tpl){
                try{
                    let data = (typeof this.body === "object")? this.body : null;
                    if(this.body && this.body.length){
                        data = JSON.parse(this.body);
                    }
                    if(typeof tpl === "function"){
                        console.log("rules-value is a function,calculate it to get tpl...");
                        tpl = tpl(data);
                    }
                    console.log(`     Render : tpl = '${tpl}.html'`);
                    yield this.render(tpl, data);
                }catch(ex){
                    console.log(ex);
                    this.status = 500;
                    yield this.render("common/error/500", {
                        'err': {
                            status: this.status,
                            statusCode: this.status,
                            expose: ex.expose || "",
                            detailInfo: ex.toString(),
                            message: ex.toString()
                        }
                    });
                }
                this.type = 'html';
                this.remove('transfer-encoding');
            }else{
                // 其他不需要渲染页面的，eg: 异步数据接口,白名单请求
                console.log(`After-Proxy: It dosn't need render page, url = "${key}"`);
            }
        }
        //
    };
};


