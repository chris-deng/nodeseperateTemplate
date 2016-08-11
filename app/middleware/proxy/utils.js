/**
 * proxy所用的utils工具函数
 */

"use strict";
const debug = require('debug')('app:proxy'),
      pathToRegexp  = require('path-to-regexp');

module.exports = {

    /**
     * 解析rules,返回数组区分常规表达式和正则表达式
     * @param rules 规则表
     * @returns {[]}
     */
    splitRules: function(rules){
        rules = rules || {};
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
    },

    /**
     * 检测是否匹配rules
     * @param key             检查值
     * @param stringRulesMap  字符串形式式Map
     * @param regexRulesMap   正则形式的Map
     * @return {Object} result
     *                  result.isMatch  是否匹配
     *                  result.value    如果匹配，返回改key对应的value值
     */
    checkMatchRules: function(key,stringRulesMap,regexRulesMap){
        var result = {
            isMatch: false,
            value: false
        };
        if(stringRulesMap.has(key)){
            result.value = stringRulesMap.get(key);
            result.isMatch = true;
        }else{
            // regex-match
            for(let rule of regexRulesMap.entries()){
                debug(rule);
                if(rule[0].exec(key)){
                    result.value = rule[1];
                    result.isMatch = true;
                    break;
                }
            }
        }
        return result;
    }

};
