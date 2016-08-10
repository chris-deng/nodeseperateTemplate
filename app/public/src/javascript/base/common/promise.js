/*
 * Created by hzwangfei3 on 2016/7/11.
 */
module.exports = {

    /**
     * 给一个promise设置一个执行timeout，超时就结束
     * @param t
     * @param promise
     * @returns {Promise}
     * @description
     * 备注：
     *   这个写法比较鬼畜，建议少用!!!
     *   因为已经违背了promise的设计初衷（promise被设计出来的初衷就是一旦执行，不可中断，不可timeout，不可取消）
     * 参见：
     *   https://github.com/whatwg/fetch/issues/20
     *   https://github.com/github/fetch/issues/175
     */
    timeoutPromise: function(t, promise) {

        t = parseInt(t) || 0;//默认不设限制

        console.log("%cYou are using a promise with %ctimeout-feature %cvia DIY,timeout = %c" + ( t ? (t+"ms") : "noLimit" ) + "%c. orz...",
            "color:#D59700;",
            "font-weight:bold;color:#D59700;",
            "color:#D59700;",
            "font-weight:bold;color:#4D67CE;font-size:14px;",
            "color:#D59700;");

        return new Promise(function(resolve, reject){

            var toutId = !t ? false : window.setTimeout(function(){
                reject(new Error("promise timeout with "+t+"ms."))
            }, t);

            promise.then(
                function(res){
                    toutId && window.clearTimeout(toutId);
                    resolve(res);
                },
                function(err){
                    toutId && window.clearTimeout(toutId);
                    reject(err);
                }
            );
        })
    }
    
};