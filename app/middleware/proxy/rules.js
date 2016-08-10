/**
 * 页面专用路由表，用以查找渲染页面所需要的 html-tpl
 * @type {Object} 页面专用路由表
 */
module.exports = {
  "GET /" : "pages/index",
  "GET /index" : "pages/index",
  "GET /upload/image":"pages/pc/upload/upload"
  // "GET /(index)?/(index)?" : "pages/index",
  // "GET /business/apply" : function(data){
  //   var status=data.business && data.business.businessStatus;
  //   if(!status || status==='CREATE' || status==='REJECT') return "pages/business/index";
  //   else if(status==='AUDITING') return "pages/business/pending";
  //   else if(status==='PASS') return "pages/index";
  //   return "pages/business/rejected";
  // },
  // "GET /activiy/:id" : "index"
};