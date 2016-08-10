/**
 * webpack配置文件
 */
var path = require('path'),
    fs = require('fs'),
    colors = require("colors"),
    notifier = require('node-notifier');
var webpack = require('webpack'),
    WebpackOnBuildPlugin = require('on-build-webpack'),
    CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin"),
    ExtractTextPlugin = require("extract-text-webpack-plugin");
console.log(colors.green('\r\nStart webpack to bundle entry javascript files success!'));
console.log(colors.magenta("Before pack,make sure mcss-compile has been executed,plz!\r\n"));

// 打包时候的状态动态提示
function doNotify(title, message, sound, isError) {
    notifier.notify({
        title: title || "提示",
        message: message || "提示内容",
        sound: sound || false,
        icon: "./src/resource/images/" + (!!isError?"error.png":"correct.png")
    }, function (err,response) {
        err && console.error(err);
    });
}


// 目录配置项
var outputPath = './dist'; // webpack打包输出目录
var publicPath = '/';  // 静态资源访问路径
var env = (process.env.WEBPACK_ENV||'').trim();


// 应用的插件
var plugins = [];
Array.prototype.push.apply(plugins,[
    new ExtractTextPlugin('css/[name].css',{allChunks:true}),//以<link src="">引入，而非<style></style>
    new WebpackOnBuildPlugin(function(stats){
        var compilation = stats.compilation;
        var errors = compilation.errors;
        if (errors.length > 0) {
            var error = errors[0];
            var msg = ":(打包出错了orz...";//var msg = error.message;//控制台去看详情吧，太长了不显示
            doNotify(error.name, msg, 'Glass', 1);
        }else {
            var message = 'takes ' + (stats.endTime - stats.startTime) + 'ms';
            var warningNumber = compilation.warnings.length;
            if (warningNumber > 0) {
                message += ', with ' + warningNumber + ' warning(s)';
            }
            doNotify('^_^打包完成', message);
        }
    })
]);
// 如果是build环境，需要多一个压缩插件
if(env === 'build'){
    plugins.push(new webpack.optimize.UglifyJsPlugin({//压缩代码
        compress: {
            warnings: false
        },
        minimize : true,
        except: ['$super', '$', 'exports', 'require']//排除关键字
    }));
}


/**
 * 将路径转换为驼峰（以/来区分为一个单词块，而非整整意义上的单词）
 *     first\\second\\third\\forth  ==>  firstSecondThirdForth
 * @param  {String} str
 * @return {String}
 */
function convertPath2CamelCase(str) {
    var ccWords = str.split('\\').join(' ').replace(/\b\w+\b/g, function(word) {
        return word.substring(0,1).toUpperCase()+word.substring(1);
    });
    ccWords = ccWords.replace(/\s/g, '');//.replace(/\-/g, '');
    return ccWords.substring(0,1).toLowerCase()+ccWords.substring(1);
}
/**
 * 获取各页面入口脚本
 * @return {JSON} files
 */
function getEntries() {
    var jsEntryPath = path.join(__dirname, 'src/javascript/pages');
    var matchs = [], files = {};
    function walk(jsPathArg){
        var dirs = fs.readdirSync(jsPathArg);
        dirs.forEach(function (item) {
            var curPath = path.join(jsPathArg,item);
            var stat = fs.lstatSync(curPath);
            if(!stat.isDirectory()){
                matchs = item.match(/(.+\.entry)\.js$/);
                if (matchs) {
                    var key = path.join(path.relative(jsEntryPath,jsPathArg), matchs[1]),
                        val = path.join(path.relative(__dirname,jsPathArg), item);
                    key = key.replace(".entry","");
                    // key = convertPath2CamelCase(key);
                    files[key] = './' + val;
                }
            } else {
                walk(curPath);
            }
        });
    }
    walk(jsEntryPath);
    return files;
}
var entries = getEntries();
console.log("Entry-files-list:\r\n",colors.gray(JSON.stringify(entries,null,2)));
console.log("process.env.WEBPACK_ENV = " + colors.yellow(env) + "\toutputPath = "+colors.yellow(outputPath));

var options = {
    // cache: true,//由--cache控制，此处不赘述
    // watch: true,//由--watch控制，此处不赘述
    devtool: "source-map",
	entry: entries,
	output: {
	    path: path.join(__dirname,outputPath),
	    filename: "js/[name].js",
        chunkFilename: "js/[hash:6].chunk.js",
        library:"",//['__api__','pages','[name]'],
        libraryTarget:'var',//"umd",
        publicPath:publicPath,
        sourceMapFilename:'sourcemap/[file].map'
	},
    externals: [
        {"regularjs": "window.Regular"},
        {"regular-ui": "window.RGUI"}
    ],
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(['css']),
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.json$/,
                loader: 'json',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.html$/,
                loader: 'raw'//'html',这里不用html，因为用html-loader的话会导致解析regular出问题
            },
            //建议：图片统一传nos，不放在本地，css代码中请写http链接地址
            {
                test: /\.(jpg|png|jpeg|gif)$/,
                loader: 'file?name=res/images/[name]_[hash:6].[ext]',
                // loader: 'url?name=images/[name]_[hash:6].[ext]&limit=8192',//小于8k大小的文件，转换成base64形式存放到css中
                exclude: /(node_modules|bower_components)/
            },
            {
                test:/\.(eot|svg|ttf|woff|otf|woff2)(\?[\s\S]+)?$/,
                loader: 'file?name=res/fonts/[name]_[hash:6].[ext]',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.(ico|icon)$/,
                loader: 'file?name=res/images/[name].[ext]',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.(swf)$/,
                loader: 'file?name=res/flash/[name].[ext]',
                exclude: /(node_modules|bower_components)/
            }
        ]
    },
    resolve:{
        alias:{
            //css
            'css_path'       : path.resolve(__dirname + "/src/css"),
            'css_com_path'   : path.resolve(__dirname + "/src/css/common"),
            'css_pages_path' : path.resolve(__dirname + "/src/css/pages"),
            //js
            "base_path"      : path.resolve(__dirname + "/src/javascript/base"),
            "common_path"    : path.resolve(__dirname + "/src/javascript/base/common"),
            "rgui_path"      : path.resolve(__dirname + "/src/javascript/base/regular-ui"),
            //css
            'res_path'       : path.resolve(__dirname + "/src/resource"),
            //third-part
            "third_path"     : path.resolve(__dirname + "/thirdpart")
        },
        unsafeCache: true,
        extensions:["",".js",".css",".json"]
    },
    plugins:plugins
};


// exports
module.exports = options;
