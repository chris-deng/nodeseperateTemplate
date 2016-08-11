# 说明文档
本工程为使用nodejs进行前后端分离的一个项目：

node负责：

1. 网络请求请求处理
2. 强请求转发给后端服务
3. 处理从后端服务返还的数据，页面渲染服务，静态资源服务

...

后端负责：

1. 接收node端转过来的请求，并处理返还数据给node端
2. 处理负责逻辑运算，操作DB，获取数据

...

特点：
分工明确，去除了以前前后端交叉的部分
- 数据及页面渲染，静态资源服务，统一交给前端
- 后端功能统一服务化，提供接口给前端
- 前后端开发并行分离，前端开发所需要的数据可以经由node来新建一个mockServer，借由本地json完成

...

缺点：
- 同一工程，需要起两套服务，一套node的，一套后端的

...

该‘代理转发方式实现前后端分离’借鉴：[jinze](https://g.hz.netease.com/u/jinze)的方式，该方式已经在pop项目中得到很好的应用

详情[基于代理转发的前后端分离开发](http://ks.netease.com/blog?id=3594)


## 环境搭建

#### 预准备
1. node安装，git安装

#### 下载源码
````
git clone %ssh-linkl%
````

#### 依赖安装
````
cd %your_local_project_dir%
npm install
cd app/public
npm install
````

## 启动程序

说明：主程入口在app/app.js,常规启动可以启动:

````
//常规启动，非热部署，不推荐
node app/app.js
````

不推荐这种原始方式，可以使用如下的系列指令进行日常开发
````
//先进到app/public文件夹之下
cd app/public
````

#### 单独启动mock服务
````
npm run mockserver
````
一个模拟后端接口的服务

#### 单独启动热服务
````
npm run hotserver
````
热启动之后，更改app/文件夹之下（除开app/public/）的文件夹里的文件，不用再重新启动


#### 单独启动mcss-watch
````
npm run mcss
````
启动后，帧听src/mcss中的*.mcss文件，并输出到src/css目录


#### 单独启动webpack打包watch
````
npm run pack
````
启动后，帧听src/javascript中的*.js文件，并输出到dist/目录


- **启动主程序之前，请确保已经将mcss编译输出！**
- **启动主程序之前，请确保已经将前端资源打包完毕！**


#### 同时启动多个服务（推荐）
````
npm run startdev
````
会同时启动上面的几个服务（mockserver,mcss,pack,hotserver），如果不想开多个窗口执行的话，这个是个不错的选择


#### 检验

````
localhost:8888/
localhost:8888/upload/image
````

## 补充

1. 兼容性：
   IE9+，FF，Chrome

2. 实时编译提示：

   建议安装一个Growl程序（仅仅是为了打包提示时候，界面好看一些，没啥特殊功能功能，就是一个提示软件，不装也行）


3. 其它文档：

- [工程目录说明](doc/工程目录说明.md)
- [开发既定约定](doc/开发既定约定.md)
