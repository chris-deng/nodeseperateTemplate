var RGUI = require('./ui');

var Notify = RGUI.Notify;

var Modal = RGUI.Modal.extend({
    config:function(data) {
        data.cancelButton = true;
        this.supr(data);
    },
    show:function() {
        this.data.visible = true;
        this.$update();
    },
    hide:function() {
        this.data.visible = false;
        this.$update();
    }
});

Modal.confirmWithText = function(message, title, callback) {
    var modal = new this({
        data:{
            contentTemplate:'<p style="margin-bottom:15px;">' + message + '</p><label>备注:<textarea2 placeholder="请填写备注" value="{remark}" /></label>',
            title:title,
            okButton:true,
            cancelButton:true
        }
    });
    modal.$on('ok', function() {
        var remark = this.data.remark;
        if ( !remark ) { return Notify.error('请填写备注'); }
        callback && callback(this.data.remark || '');
    });
    return modal;
};

module.exports = Modal;

