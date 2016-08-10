# public前端工程说明

## 自动化指令

#### npm脚本
开发：(开启server，开启所有dev-watch)
````
npm run startdev
````
发布：（仅做打包输出，不启动server）
````
npm run deploy
````

#### 其他指令
gulp指令查看帮助
````
gulp
gulp help
````

#### 补充

为了在开发时候灵活，本工程将各个职责进行分工细化，在组合起来，而非只提供一个总指令

指令之间的关系：
````
mcss 职责为将*.mcss生成src/css/**/*.css
pack 职责为将*.entry.js生成 dist/js/**/*.js 和 dist/css/**/*.css
gulp build 职责为将已经生成好的dist/目录之下的文件做处理，如md5等操作

1.在pack之前，至少保证已经执行过一次mcss任务，否则打包有可能出错
原因是因为没有生成src/css/**/*.css
2.在gulp build之前，至少保证已经打包过一次
````

太多了，不想看？只需记住最开始说的两个指令即可
````
// 开发
npm run startdev
// 发布
npm run deploy
````


## 目录说明

````
app/public
    │
    ├── dist       打包之后的输出，css，js，font，image，sourcemap
    │
    ├── mainfest   md5操作记录映射表，详情看 manifest.json
    │
    ├── src        前端开发主要目录
    │
    ├── thirdpart  第三方依赖资源库，多为脚本，如：regular，regular-ui等
    │
    ├── gulpfile.js
    │
    ├── package.json
    │
    └── webpack.config.js
````

#### dist目录：
````
public/dist
    │
    ├── css 样式文件，需要说明的是，这里生成的样式文件的规则：
    │       这里与src/css,src/mcss不是直接联系，更不是一一对应关系
    │       而是与src/目录中各个脚本入口文件 *.entry.js对应，是由于入口文件中载入了css而产生
    │       具体为 require("xxx.css")，这里文件名由webpack统一配置成
    │       与XXX.entry.js入口文件的XXX部分保持一致
    │
    ├── js  脚本输出，与src中的xxx.entry.js命名不同，这里去掉了后缀entry，直接叫xxx.js
    │
    ├── res 资源文件，包括css中使用的image，font等
    │
    └── sourcemap sourcemap文件夹

````

#### src目录：
````
public/src
    │
    ├── css 样式文件
    │       有同级目录下的 mcss下的*.mcss文件一一对应，由*.mcss编译而成
    │
    ├── jsvascript  开发脚本，其中，命名格式为 xxx.entry.js的文件表示webpack入口文件
    │               会被webpack在打包的时候作为入口识别，名生成public/dist目录下对应脚本
    │                 src/javascript/**/XXX.entry.js   =>   dist/js/**/XXX.js
    │               如果require了css目录下的样式文件：
    │                 src/javascript/**/XXX.entry.js   =>   dist/css/**/XXX.css
    │
    ├── mcss 样式源文件，*.mcss，与src/css中的*.css文件一一对应
    │        备注：请不要再js文件直接require("xxx.mcss会报错，因为本工程没有放mcss-loader
    │        而采用了直接用mcss指令去编译生成到src/css/*.css
    │
    └── resource 资源文件夹，包含image，font，与dist/res对应
                 需要注意的是，这里并不是意义对应关系，而是，只有使用到的文件在会被webpack
                 加到dist/res中去。这里“使用到的文件”是指那些在js或者css中被引用到的资源
                 eg: css中的 background-image:url(resource/images/xxx.png)
                     js中的 require("resource/swf/xxx.swf");
````

#### thirdpart目录：
避免webpack高频率的去打包一些不会更改的公共资源，将之都放到这里来

说明请见[thirdpart/README.md](thirdpart/README.md)


#### 补充：
webpack配置，都是依赖于当时情况所决定的配置，并不是万用的万金油，
后面随着时间的迁移，需求的更改，以及个人的需要，可以自行更改

require时候的一些路径简写对照：
````
//css
'css_path'       : src/css
'css_com_path'   : src/css/common
'css_pages_path' : src/css/pages
//js
"base_path"      : src/javascript/base
"common_path"    : src/javascript/base/common
"rgui_path"      : src/javascript/base/regular-ui
//css
'res_path'       : src/resource
//third-part
"third_path"     : thirdpart
````

脚本中使用
````
require("src/javascript/base/common/hahaha.js")
可写成：
require("common_path/hahaha.js")
````





