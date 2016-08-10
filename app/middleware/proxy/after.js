/**
 * 代理结束后，寻找对应模板进行渲染
 */

"use strict";
var debug = require('debug')('app:proxy'),
    pathToRegexp  = require('path-to-regexp');

/**
 * 解析rules.js,返回数组区分常规表达式和正则表达式
 * @param rules 页面渲染模板路径映射表
 * @returns {[]}
 */
function splitRules(rules){
  var stringRulesMap = new Map();
  var regexRulesMap = new Map();
  for(let key in rules){
    if(key.indexOf(":") > -1 || key.indexOf("(") > -1){
      regexRulesMap.set(pathToRegexp(key), rules[key]);
    }else{
      stringRulesMap.set(key, rules[key]);
    }
  }
  return [stringRulesMap, regexRulesMap];
}

// exports
module.exports = function(rules){

  var ruleMaps = splitRules(rules);
  var stringRulesMap = ruleMaps[0];
  var regexRulesMap = ruleMaps[1];

  return function *(next){
    var key = `${this.method.toUpperCase()} ${this.path}`;
    debug(key);
    try{
        yield next;
        console.log("After-proxy, (render page if proxy work ,or do nothing.)");
    }catch(ex){
        console.error(ex);
        key = "500";
        this.status = 500;
        this.body = {message: ex.toString()};
    }
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
    // 查找渲染模板文件：同步页面接口-有模板，异步数据接口-无模板
    var tpl = null;
    // normal-expression
    if(stringRulesMap.has(key)){
        tpl = stringRulesMap.get(key);
    }else{
        // regex-expression
        for(let rule of regexRulesMap.entries()){
            debug(rule);
            if(rule[0].exec(key)){
                tpl = rule[1];
                break;
            }
        }
    }
    // 同步数据接口
    if(!!tpl){
      console.log(`Render-tpl = '${tpl}.html'`);
        try{
            let data = (typeof this.body === "object")? this.body : null;
            if(this.body && this.body.length){
                data = JSON.parse(this.body);
            }
            if(typeof tpl === "function"){
                tpl = tpl(data);
            }
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
        console.log(`It isn't render page, undefined key('${key}') in rules-file('app/middleware/proxy/rules.js')`);
    }
  };
};


