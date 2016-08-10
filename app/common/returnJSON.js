/**
 * @TODO 处理服务端返还的请求数据，统一格式
 * @param data
 * @param code
 * @param pageInfo
 * @param message
 * @returns {Object}
 *          {
 *              code: *,
 *              msg: (*|string),
 *              data: (*|Object),
 *              list: (*|Array)，
 *              pageInfo: (*|Object)
 *          }
 */
exports.json = function(data,code,pageInfo,message){
    var obj ={
        code:code,
        msg:message||'操作成功'
    };
    if(Array.isArray(data)){
        obj.list = data;
        obj.pageInfo = pageInfo ||{}
    } else{
        obj.data = data;
    }
    return obj;
};