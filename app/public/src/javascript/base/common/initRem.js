/*
 * Created by hzwangfei3 on 2016/7/22.
 * 初始化rem信息
 *
 * 这里不作为工具使用，仅仅作为文件内容备份，具体代码已经压缩并放入html的头部script标签中
 *
 */
module.exports = function(){

    (function(win){

        var remInfo = win.remInfo || {},
            _t = null;
        
        /**
         * 初始化rem
         * @param uiWidth  ui视觉稿的宽度
         * @param cssProcessBase css预处理器中的base（建议不要改，大家统一一下，均为10好了，1px=1/10rem）
         * 备注：
         *     uiWidth和cssProcessBase组合的意义：表示视觉稿上，uiWidth宽度(px单位) = ( uiWidth / cssProcessBase ) rem
         *     eg: uiWidth=640 & cssProcessBase=100
         *             ==>  视觉稿为640px，该长度对应 6.4rem(即：=640/100)
         *             ==>  1px = 0.1rem(即：=1/100)
         * 补充：
         * 鉴于ui设计师的不统一，有些640有些750，这里采用最大的iPhone6Plus的宽750为最大边界默认值
         */
        function _setRem(uiWidth,cssProcessBase){
            cssProcessBase = cssProcessBase || 100;
            uiWidth = uiWidth || 640;
            var docEle = win.document.documentElement;
            var w = Math.min(docEle.clientWidth,uiWidth);
            var ftSz =  w / ( uiWidth / cssProcessBase );
            docEle.style.fontSize = ftSz + "px";

            // fixed difference between rem-value and actually font-size after browser computed
            var actualSize = parseFloat(window.getComputedStyle(document.documentElement)["font-size"]);
            if (actualSize !== ftSz && actualSize > 0 && Math.abs(actualSize - ftSz) > 1) {
                var remScaled = ftSz * ftSz / actualSize;
                docEle.style.fontSize = remScaled + "px";
                ftSz = remScaled;
            }
            remInfo.rem = ftSz + "px";
        }
        // throttle to refresh
        function _resetRem(){
            !!_t && clearTimeout(_t);
            _t = setTimeout(function(){
                _setRem(remInfo.uiWidth, remInfo.cssBase);
            },100);
        }
        // set rem info
        remInfo.updateRemParams = function(w,b){
            this.uiWidth = w || 640;
            this.cssBase = b || 100;
            _resetRem();
        };
        // init at once
        remInfo.updateRemParams(640,100);

        // watch-change
        win.addEventListener("resize", function () {
            _resetRem();
        }, false);
        win.addEventListener("pageshow", function (e) {
            !!e && !!e.persisted && _resetRem();//fixed browser cache,calculate the last rem
        }, false);
        // bind to object
        win.remInfo = remInfo;

    })(window);
};