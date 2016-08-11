/*
 * Created by hzwangfei3 on 2016/8/4.
 */

var fileParse = require('co-busboy'),
    probe = require('probe-image-size'),
    fs = require("fs"),
    colors = require("colors");
var nosUtil = require('../common/nos');
var Upload = new nosUtil();
// var config = require("config"),
//     nosOpts = config.get("nos");
// var Upload = new nosUtil(nosOpts);


// 创建放图片的临时目录
var tmpDir = 'tmp';
if (!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
}


module.exports = {
    // 页面
    uploadImagePage:function* (next){
        yield this.render('pages/pc/upload/upload');
    },

    // 接口 - 传文件
    uploadfile: function* (next) {
        var files = fileParse(this);
        var file;
        while(file = yield files){
            var url = yield new Promise(function(resolved, rejected) {
                Upload.upload(file, file.filename,function(result) {
                    if(!result.err && result.code == 200 ) {
                        resolved(result.url);
                    } else {
                        new Error('http ret code' + result.code);
                        rejected();
                    }
                });
            });
        }
        //防止IE因为response的Content-Type为application/json的时候，去下载json文件
        this.response.type = "text/html";
        this.body = `{ code: 200, message: '上传成功',url:"${url}"}`;
    },

    // 接口 - 传图片
    uploadIMG:function* (next){

        var files = fileParse(this);
        
        var imgsize = this.query.imgsize,
            width,
            height,
            url,
            message;
        if(imgsize){
            console.log(imgsize);
            var tmp = imgsize.split('*');
            width = tmp[0];
            height = tmp[1]
        }
        while(file = yield files){
            var tmpfile = './tmp/tmpImg`'+Math.floor(Math.random()*10000)+file.filename;
            var fileWriteStream;// = fs.createWriteStream(tmpfile);
            try{
                fileWriteStream = fs.createWriteStream(tmpfile);
            }catch(e){
                console.log("HHHHHHH\r\n",e);
            }

            file.pipe(fileWriteStream);

            url = yield new Promise(function(resolved, rejected) {
                Upload.upload(file, file.filename,function(result) {
                    if(!result.err && result.code == 200 ) {
                        resolved(result.url);
                    } else {
                        new Error('http ret code' + result.code);
                        rejected();
                    }
                });
            });
            var data = fs.readFileSync(tmpfile);
            var dimensions = probe.sync(data);
            fs.unlink(tmpfile);
            if( ((width&&dimensions.width==width)||!width)
                && (!height||height&&dimensions.height==height)){
                message = false;
            }else if(!width&&!height){
                message = false;
            }else{
                message = '图片尺寸不符!'
            }
        }
        //防止IE因为response的Content-Type为application/json的时候，去下载json文件
        this.response.type = "text/html";
        this.type = "html";
        this.status = 200;
        if(message){
            this.body = "{ code: 201, message: '图片尺寸不符!'}";
        } else{
            this.body = `{ code: 200, message: '上传成功',url:"${url}"}`;
        }
    }
};
