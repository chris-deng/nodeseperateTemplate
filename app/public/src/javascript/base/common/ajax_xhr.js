/*
 * Created by hzwangfei3 on 2016/7/25.
 */
var _ua = navigator.userAgent.toLowerCase(),
    isIE = /msie/.test(_ua);
module.exports = {
    /**
     * 获取Ajax对象
     * @return {Object} xmlHttp
     */
    getAjaxObj:function(){
        var xmlHttp;
        try {
            //chrome, Firefox, Opera 8.0+, Safari
            xmlHttp = new XMLHttpRequest();
        } catch (e) {
            // Internet Explorer
            try {
                //IE5，6
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                console.log("getAjaxObj:getActiveXObject ie56");
            } catch (e) {
                try {
                    //IE7以上
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    console.warn("getAjaxObj:抱歉！您的浏览器不支持AJAX！您有如下三个解决方案：\r\n","A:换浏览器","B:换浏览器","C:换浏览器...");
                    return false;
                }
            }
        }
        return xmlHttp;
    },

    /**
     * 发送ajax请求
     * @param {String} url
     * @param {Object} options
     *     options.method:请求方式 [ post | get ]
     *     options.async:是否异步[true | false ]
     *     options.param:请求的参数
     *     options.callback(res):请求的回调方法
     */
    ajax:function(url,options){
        // 每个请求一个独立的xhr对象
        var xmlhttp = this.getAjaxObj();
        if(!xmlhttp){
            return false;
        }
        var method,async,param,callback;
        url = url || "";
        if(!url){

        }
        method = options.method || "get";
        async = options.async || true;
        param = options.param;
        callback = options.callback || false;
        // 输出
        var outStr = (!isIE?"Ajax:%c":"Ajax:")+url,
            outStr2 = !isIE?"color:#00B4B4;font-style:italic;":"";
        console.info(outStr,outStr2);
        !async && console.warn("骚年，你在用\"同步\"请求啊？你知不知道酱紫很危险！");
        // 配置
        xmlhttp.onreadystatechange = function(){
            /*
             readyState:
             0:初始化,XHR对象已经创建,还未执行open
             1:载入,已经调用open方法,但是还没发送请求
             2:载入完成,请求已经发送完成
             3:交互,可以接收到部分数据
             4:完成交互并接受响应
             status:
             200:成功
             404:没有发现文件、查询或URl
             500:服务器产生内部错误
             */
            if(xmlhttp.readyState == 4/* && xmlhttp.status == 200*/){
                // HTTP响应已经完全接收才调用
                callback && callback.call(this,xmlhttp);
            }else{
                //console.log("Ajax-Step:( readyState:"+xmlhttp.readyState+" | status:"+xmlhttp.status+" )");
            }
        };
        xmlhttp.open(method,url,async);
        xmlhttp.send(param);
    }
};