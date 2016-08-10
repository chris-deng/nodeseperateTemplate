// style -> demo/index.css
require("css_pages_path/pc/upload/index.css");

var RGUI   = require('rgui_path/ui'),
    Notify = RGUI.Notify,
    tpl = require('./view.html');
var Clipboard = require("clipboard");

var Page = RGUI.extend({
    template:tpl,
    config:function(data){
        data.btnCopyText = 0;
        this.supr(data);
    },
    init:function(){
        var self = this,
            data = self.data;
        self.$on("inject",function(){
            self.clipboard = new Clipboard('#btnCopy', {
                text: function(trigger) {
                    return data.imgUrl;
                }
            });
            self.clipboard.on('success', function(e) {
                data.btnCopyText = 1;
                self.$update();
                window.setTimeout(function(){
                    data.btnCopyText = 0;
                    self.$update();
                },1500);
            });
            self.clipboard.on('error', function(e) {
                console.error('Action:', e.action);
                console.error('Trigger:', e.trigger);
            });
            // 图片淡入显示
            self.$refs.previewImg.addEventListener("load",function(){
                this.setAttribute("class","fadeIn");
            });
        });
    },
    _onError:function(){
        this.data.imgUrl = "";
        this.$refs.previewImg.setAttribute("class","");
        this.$update();
    },
    _onSuccess:function(event){
        var result = eval('(' + event.data + ')');//此处导致不能再js文件头部加上'use strict',因为ES5的严格模式不允许eval
        if(result.code==201){
            Notify.error('图片尺寸不符')
        }else if(result.code==200){
            this.data.imgUrl = result.url;
            this.$update();
            Notify.success('上传成功！');
        }
    }
});

new  Page({data:{}}).$inject(document.getElementById("box"));