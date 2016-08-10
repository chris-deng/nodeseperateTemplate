/*
 * Created by hzwangfei3 on 2016/7/11.
 * 常用请求处理工具
 */

// 以下补丁注释掉，仅作记录用，PC端的话，这些补丁在pc/base.entry.js中,而移动端采用h5相关内核，也不需要这些补丁
// polyfill & shim
// require('es5-shim');
// require('es5-shim/es5-sham');
// require('console-polyfill');
// require('es6-promise');
// require('fetch-polyfill');


var promiseUtil = require("./promise");

module.exports = {

    /**
     * 请求，并接收json格式数据
     * @param {String} url
     * @param {Object} opts
     * @returns {Promise}
     */
    $request:function(url, opts) {

        opts.method = opts.method || "post";

        // 增加credentials:include， 否则请求（跨域时）header里没带cookie
        opts.credentials = opts.credentials || 'include';

        // 目前fetch自身还加不了timeout（本质原因是fetch返回的是一个promise对象，一旦发起，不能中断，不能超时，只能resolve和reject，）
        opts.timeout = opts.timeout || 0;//默认无限制

        //return fetch(url, opts) //备份：非timeout的写法，此行注释请保留，跪求别删！！！
        return promiseUtil.timeoutPromise(opts.timeout,fetch(url, opts)) //加了timeout的写法
            .then(
                function(res) {
                    return res.json();
                },
                function(e) {
                    console.error("请求失败：\r\n",e);
                    return false;
                }
            )
            // 格式要求：{code,message,data,pageInfo}
            .then(
                function(json) {
                    if ( !!json ){
                        // code非200
                        if ( json.code != 200 ) {
                            console.warn("请求出错:\r\n",json);
                            var errInfo = json.message || '出错了，请稍后重试！';
                            if ( !opts.continueOnError ) {
                                throw new Error(json.code+"(\""+errInfo+"\")");
                            }else{
                                console.warn("查询接口异常！\r\n"+json.code+" (\""+errInfo+"\")");
                            }
                        }
                    } else {
                        //请求失败，eg:超时，服务器异常等
                        console.log("请求失败,res=",json);//请求失败
                    }
                    return json;
                },
                function(e){
                    // 1.服务器发生错误 2.返回格式有问题(非json)
                    console.error("服务器出错 => Response.json()异常/错误：\r\n",e);
                    return false;
                }
            )
            .then(
                undefined,
                function(e){
                    //处理前一条then的resolve分支
                    console.error("成功返回数据，但数据异常！\r\n (code!=200 && continueOnError==false)\r\n",e);
                    return false;
                }
            );
        // 用上面的then(null,function(){});替代下面的catch，因为在IE8不兼容。两种写法效果相同
        //
        // .catch(
        //     function(e){
        //         console.error("查询接口异常！\r\n (code!=200 && continueOnError==false)\r\n",e);
        //         return false;
        //     }
        // );
        //
        // 或者还有一种方法如下:
        // ["catch"](
        //     function(e){
        //                 console.error("查询接口异常！\r\n (code!=200 && continueOnError==false)\r\n",e);
        //                 return false;
        //             }
        // );
        //
        // 原因：catch在<ie8的情况下，会被认为是保留关键字
    },

    /**
     * 请求，接收数据格式不限制
     * @param {String} url
     * @param {Object} opts
     * @returns {Promise}
     */
    $ajax:function(url, opts){

        opts.method = opts.method || "post";

        opts.credentials = opts.credentials || 'include';

        opts.timeout = opts.timeout || 0;

        return promiseUtil.timeoutPromise(opts.timeout,fetch(url, opts));

    }
};
