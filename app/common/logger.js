/**
 * 日志
 */
var winston = require('winston');
var moment = require('moment');
var fs = require('fs');

// 创建日志目录
var logDir = 'logs';
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

var logger = new (winston.Logger)({
    transports: [
        // new (winston.transports.Console)({ // 所有日志通过终端打印
        //     level: 'debug',
        //     timestamp: function() {
        //       return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
        //     },
        //     formatter: function(options) {
        //       return options.timestamp() + ' ' + options.level.toUpperCase() + ' ' + options.message;
        //     }
        // }),
        new (winston.transports.File)({ // 错误日志记录
            name: 'error_log',
            filename: logDir + '/error.log',
            level: 'error',
            timestamp: function() {
              return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
            }
        }),
        new (winston.transports.File)({ // 访问日志记录
            name: 'access_log',
            filename: logDir + '/access.log',
            level: 'info',
            timestamp: function() {
              return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
            }
        })
    ]
});

module.exports = logger;
