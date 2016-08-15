/**
 * 白名单内请求不做代理，直接node工程解析，比如：
 *    图片上传，文件上传，数据不会更改的静态页面
 *
 * @type {Object} 不代理的名单（白名单）
 *         key -> 请求
 *       value -> 1.String:渲染模板tpl
 *                2.Function*:请求处理的generator函数（这里和rules.js中的处理方式有区别）
 * 这里需要说明一下：
 *    1.白名单以内的请求，是node这边进行处理，所以不涉及到数据的请求，不涉及到后端逻辑数据
 *    2.value的两种情况：
 *        1).value 为string字符串的:  ->  纯页面渲染处理，直接调用this.render
 *        2).value 为一个generator函数的，即：function*(nex):  ->  交给对应的Generator函数去处理
 *
 */

var cUpload = require("../../../controllers/cUploadFile");


// exports
module.exports = {
    "GET /test-white-rules": "xxxx",
    "GET /upload/image":"pages/pc/upload/upload",
    "POST /uploadimg": cUpload.uploadIMG
};