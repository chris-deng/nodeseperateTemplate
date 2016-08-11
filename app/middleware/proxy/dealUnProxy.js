/**
 * 处理“代理白名单”里面的请求
 */
'use strict';
const util = require("./utils"),
      debug = require('debug')('app:proxy');

module.exports = function(options){
    options = options || {whiteRules:null};

    // rules白名单
    var whiteRulesMaps = util.splitRules(options.whiteRules || {}),
        whiteStrRulesMap = whiteRulesMaps[0],
        whiteRegexRulesMap = whiteRulesMaps[1];

    return function *(next) {
        var reqUrl = `${this.method.toUpperCase()} ${this.url}`;//格式请勿更改，method和url之间有且只有一个空格
        debug(reqUrl);

        yield next;

        var check = util.checkMatchRules(reqUrl,whiteStrRulesMap,whiteRegexRulesMap);

        if(check.isMatch){
            console.log(`DealUnProxy: url = ${reqUrl}`);
            var val = check.value;
            if(typeof val == "string"){
                // 情况1.直接render
                try{
                    let data = (typeof this.body === "object")? this.body : null;
                    if(this.body && this.body.length){
                        data = JSON.parse(this.body);
                    }
                    yield this.render(val, data);
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
                // 情况2.调用Generator-Function
                yield val;
            }

        }else{

            console.log(`~<Skip>~ DealUnProxy!! url = "${reqUrl}", bacause rules isnot in white-list!`)

        }
        //
    }
};