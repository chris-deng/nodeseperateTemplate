/**
 * error
 */
const util = require('util');

function JsonError(message) {
    var err = Error.call(this, message);
    err.name = 'JsonError';
    return err;
}
util.inherits(JsonError, Error);

function PageError(message) {
    var err = Error.call(this, message);
    err.name = "PageError";
}
util.inherits(PageError, Error);

exports.JsonError = JsonError;
exports.PageError = PageError;
