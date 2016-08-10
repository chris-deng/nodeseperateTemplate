/**
 * gulp配置文件
 * 主要任务，将 $path_dev_html 目录下的文件发布到 $path_build_html 目录，并将引用的js和css做md5处理
 * 备注：
 *     1.先得确保webpack已经执行,并成功产出资源到 $path_build 目录，否则本脚本无效
 *     2.js&css的压缩在webpack中，不在这里做
 *     3.html的压缩在这里做
 *     4.项目工程约定：开发过程中，js和css文件命名中，不允许出现/-^[a-z0-9]{10}.js$/
 *       (即: '-'+'10位md5值.(js|css)' 的命名格式不被允许，eg:'demo-afb1487da0.js','demo-afb1487da0.css')
 */
var gulp = require('gulp'),
    clean =  require('gulp-clean'),
    minHtml = require('gulp-htmlmin'),
    runSequence = require('gulp-sequence'),
    colors = require("colors"),
    dtFmt = require('date-format'),
    fs = require("fs"),
    path = require("path"),
    fileExist = fs.existsSync || path.existsSync;
console.log(colors.green('\r\nStart gulp-tasks to: Copy html(views_dev_path => views_build_path), Md5 js,css & rename in html, Compress html.'));



// paths config
var path_build = './dist',
    path_dev_html = '../views/src',
    path_build_html = '../views/dist';
console.log("["+colors.gray(dtFmt.asString("hh:mm:ss",new Date()))+"] Path: "
    +"path_build="+colors.magenta(path_build)
    +" & path_dev_html="+colors.magenta(path_dev_html)
    +" & path_build_html="+colors.magenta(path_build_html)
);



// clean *.html files in path_build_html
gulp.task('cleanViewsOutFiles',function(){
    return gulp.src([path_build_html+'/**/*.html'])
        .pipe(clean({force: true}))
        .on("error",function(e){
            console.log(colors.red("Error:cleanViewsOutFiles出错...\r\n",JSON.stringify(e,null,2)));
        });
});



// copy *.html files from path_dev_html to path_build_html
gulp.task('copyHtml',function(){
    return gulp.src(path_dev_html+'/**/*.html')
        .pipe(gulp.dest(path_build_html))
        .on("error",function(e){
            console.log(colors.red("Error:copyHtml出错...\r\n",JSON.stringify(e,null,2)));
        });
});



/*
 * 为了防止插件作者胡来（版本升级导致默认配置更改），这里讲版本号固定死 version 7.1.0
 * 此版本下将 A.B.js  ->  A-??????????.B.js  md5有10位长,固定以‘-’符号开头
 * 特别注意：不是在最末尾了，老版本是在最末尾
 */
var gRev = require('gulp-rev'),
    gRevRemoveOrigin = require("gulp-rev-delete-original"),
    gRevCollector = require('gulp-rev-collector'),
    revMd5Pattern = "-??????????",
    path_manifest = './manifest';
gulp.task('md5',function(){
    return gulp.src([
            path_build+'/**/*.css',
            path_build+'/**/*.js',
            //排除以下四种已经是md5格式的文件：
            '!'+path_build+'/**/*' + revMd5Pattern + '.*.css', // xxx-cba55186ae.xxxxx.css
            '!'+path_build+'/**/*' + revMd5Pattern + '.css',   // xxx-cba55186ae.css
            '!'+path_build+'/**/*' + revMd5Pattern + '.*.js',  // xxx-cba55186ae.xxxxx.js
            '!'+path_build+'/**/*' + revMd5Pattern + '.js'     // xxx-cba55186ae.js
        ])
        .pipe(gRev())
        .pipe(gulp.dest(path_build))
        // .pipe(gRevRemoveOrigin())//同时删除源文件
        .pipe(gRev.manifest('manifest.json'))
        .pipe(gulp.dest(path_manifest))
        .on("error",function(e){
            console.log(colors.red("Error:revMd5出错...\r\n",JSON.stringify(e,null,2)));
        });
});
gulp.task('revAfterMd5',function(){
    return gulp.src(
        [
            path_manifest+"/*.json",//配置文件
            path_build_html+'/**/*.html'//目标文件
        ])
        .pipe(gRevCollector())
        .pipe(gulp.dest(path_build_html))
        .on("error",function(e){
            console.log(colors.red("Error:revAfterMd5出错...\r\n",JSON.stringify(e,null,2)));
        });

});



// compress *.html in path_build_html
gulp.task('minHtml',function(){
    return gulp.src(path_build_html+'/**/*.html')
        .pipe(minHtml({collapseWhitespace: true,removeComments:true}))
        .pipe(gulp.dest(path_build_html))
        .on("error",function(e){
            console.log(colors.red("Error:minHtml出错...、\r\n",JSON.stringify(e,null,2)));
        });
});



// run all tasks one by one
gulp.task('build',function(cb){
    runSequence('cleanViewsOutFiles','copyHtml','md5','revAfterMd5','minHtml',cb);
});



// clean files(*.js & * .css) in path_build，this task is only used in npm-scripts 'prepack'
gulp.task('cleanFilesOfDist',function(){
    return gulp.src([path_build+'/**/*.*'])
        .pipe(clean({force: true}))
        .on("error",function(e){
            console.log(colors.red("Error:cleanDist出错...\r\n",JSON.stringify(e,null,2)));
        })
        .on("end",function(){
            console.log(colors.yellow("Clean all files in \""+path_build+"\" succeed!"));
        });
});



// help 任务清单说明
gulp.task('default',["help"]);
gulp.task('help',function(){
    var tasks = [
        {name:"               help", des:"查看帮助" },
        {name:" cleanViewsOutFiles", des:"将'view输出目录'内的视图文件清空" },
        {name:"           copyHtml", des:"将'view输入目录'内的视图文件拷贝到'view输出目录'" },
        {name:"                md5", des:"将所有的*.css，*.js进行md5重命名，同时删除对应源文件" },
        {name:"        revAfterMd5", des:"根据md5生成前后的映射表manifest.json去更新替换*.html中css和js的引用" },
        {name:"            minHtml", des:"压缩*.html" },
        {name:"              build", des:"构建，依次串行执行tasks: 'cleanViewsOutFiles','copyHtml','md5','revAfterMd5','minHtml' " },
        {name:"   cleanFilesOfDist", des:"删除wepack打包输出目录中的*.css，*.js" }
    ];
    console.log("\r\n$ "+colors.cyan("gulp xxx"));
    var i = 0, iLen = tasks.length, t = null;
    for(; i < iLen; i++){ console.log(colors.cyan(tasks[i].name)+"   "+tasks[i].des+"\r\n"); }
});
