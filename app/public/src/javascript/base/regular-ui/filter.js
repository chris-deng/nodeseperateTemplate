var moment = require('moment');

module.exports = {
    format:function(val, format) {
        return moment(val).format(format || 'YYYY-MM-DD hh:mm');
    }
};