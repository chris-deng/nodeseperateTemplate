# 第三方公共的资源

### 说明：

将第三方公共的资源放到这里，如css，js，资源文件等，

其中js资源，在webpack中配置external，防止一些高频使用的第三方脚本库被频繁的打包

````
externals:{
    "jquery": "window.$",
    "regularjs": "window.Regular",
},
````

### 使用

src的值中，加上/lib前缀即可：

````
<!-- 例如：想要引用/thirdpart/jquery.min.js,写法如下 -->
<script src="/lib/jquery.min.js"></script>
<script src="/lib/regular.min.js.js"></script>
````

备注：/lib配置已经用koa-static写到app里，所以不必在自己折腾了

### 补充

##### 关于regular-ui的一个坑

vendor之下是regularJS的核心脚本包，js之下才是regular-ui的核心包，然而，这里有一个坑

````
vender/regular.min.js可以放到<head>标签内部引用，不报错
js/regular-ui.min.js不能放到<body>标签外面，会报错
    ↓↓↓
工程的views层，common模板里头，这两个文件时分开放置的位置，并非都放到了head中
````

