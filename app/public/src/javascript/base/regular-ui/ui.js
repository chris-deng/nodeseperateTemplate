var RGUI = require('regular-ui'),
    Notify = RGUI.Notify,
    filters= require('./filter'),
    ajax_fetch = require("common_path/ajax_fetch");
 
var NEWRGUI = RGUI.Component.extend({

    
    $request:function(url, opts) {
        return ajax_fetch.$request(url,opts);
    },

    $ajax:function(url, opts) {
        return ajax_fetch.$ajax(url,opts);
    }

});

// RGUI.Component.filter(filters || {});
NEWRGUI.filter(filters || {});
//Notify,Modal
NEWRGUI.Notify = RGUI.Notify;
NEWRGUI.Modal = RGUI.Modal;

// module.exports = RGUI;
module.exports = NEWRGUI;