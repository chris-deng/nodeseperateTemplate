'use strict';
//仅仅是提示用
var notifier = require('node-notifier');

var doNotify = function(title, message, sound, isError) {
    notifier.notify({
        title: title || "提示",
        message: message || "提示内容",
        sound: sound || false,
        icon: "./app/public/src/resource/images/" + (!!isError?"error.png":"correct.png")
    }, function (err,response) {
        err && console.error(err);
    });
};

module.exports = doNotify;