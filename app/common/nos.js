/**
 * nosUtil
 * @todo upload file
 * 注意点（坑）：
 *     nos上传成功之后的response返还的格式是application/json
 *     这种格式在IE下，上传成功之后，会被当成json文件，提示你下载...
 */
var http = require('http'),
    crypto = require('crypto'),
    fs = require('fs'),
    request = require('request'),
    util = require('util'),
    _ = require('./util'),
    xml2js = require('xml2js'),
    qs = require('querystring');
var config = require("config"),
    nosOpts = config.get("nos");//default options

// constructor
function Upload(opts) {
    opts = opts || {};
    this.host = opts.host || nosOpts.host;
    this.port = opts.port || nosOpts.port;
    this.accessSecret = opts.accessSecret || nosOpts.accessSecret;
    this.accessId = opts.accessId || nosOpts.accessId;
    this.bucket = opts.bucket || nosOpts.bucket;
}

// prototype

/*
 * bucket {String} bucket name
 * cb {Function} callback
 */
Upload.prototype.list = function list (cb) {
    var date = rfc1123_time();

    //  {method}\n{content-md5}\n{content-type}\n{date}\n{resource}
    var canonicalized_str = util.format('GET\n\n%s\n%s\n/%s/',
        CONTENT_TYPE_NO_BODY, date, this.bucket);

    var auth = calc_auth(this.accessSecret, canonicalized_str);

    var opts = {
        url: util.format('http://%s:%s/%s/?max-keys=100', this.host, this.port, this.bucket),
        headers: {
            'Date': date,
            'Content-Type': CONTENT_TYPE_NO_BODY,
            'authorization': util.format('NOS %s:%s', this.accessId, auth),
            'Connection': 'close',
            'User-Agent': DEFAULT_USER_AGENT,
            'Host': this.host
        },
        // 5 sec timeout
        timeout: 5000
    };

    request.get(opts, function(err, resp, body) {
        if (!err && resp.statusCode === 200) {

            xml2js.parseString(body, {trim: true}, function(err, res) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, res);
                }
            });

        } else {
            if (err) {
                cb(err);
            } else {
                cb(new Error('http ret code ' + resp.statusCode));
            }
        }
    });
};

/*
 * bucket {String} bucket name
 * filepath {String} file path
 * key {String} file key
 * cb {Function} callback(err)
 */
Upload.prototype.uploadFile = function uploadFile (filepath, key, cb) {
    if (!fs.existsSync(filepath)) {
        cb(new Error('file not found'));
        return;
    }

    fs.createReadStream(filepath).pipe(this._upload(key, cb));
};

/*
 * bucket {String} bucket name
 * str {String|Buffer} file content
 * key {String} file key
 * cb {Function} callback(err)
 */

Upload.prototype.uploadStr = function uploadFile (str, key, cb) {
    this._upload(key, cb).end(str);
};

Upload.prototype.upload = function uploadFile (file, key, cb) {
    key = _.randString(15)+key;
    this._upload(key, cb,file)
};
/*
 * bucket {String} bucket name
 * key {String} file key
 * cb {Function} callback(err, Buffer)
 */
Upload.prototype.downloadBuffer = function downloadBuffer( key, cb) {
    var buffer = null;
    var req = this._download(key, function(err) {
        if (err) {
            cb(err);
        }
    });

    req.on('data', function(data) {
        if (buffer === null) {
            buffer = data;
        } else {
            buffer = Buffer.concat([buffer, data]);
        }
    });

    req.on('end', function() {
        cb(null, buffer);
    });
};


/*
 * bucket {String} bucket name
 * filepath {String} file path
 * key {String} file key
 * cb {Function} callback(err)
 */
Upload.prototype.downloadFile = function downloadFile (filepath, key, cb) {
    this._download(key, cb).pipe(fs.createWriteStream(filepath));
};

/*
 * bucket {String} bucket name
 * key {String} file key
 * cb {Function} callback(err)
 */
Upload.prototype.remove = function remove (key, cb) {
    var date = rfc1123_time();

    key = qs.escape(key);
    // {method}\n{content-md5}\n{content-type}\n{date}\n{resource}
    var canonicalized_str = util.format('DELETE\n\n%s\n%s\n/%s/%s', CONTENT_TYPE_NO_BODY, date, this.bucket, key);
    var auth = calc_auth(this.accessSecret, canonicalized_str);

    var opts = {
        url: util.format('http://%s:%s/%s/%s', this.host, this.port, this.bucket, key),
        headers: {
            'Date': date,
            'Content-Type': CONTENT_TYPE_NO_BODY,
            'Authorization': util.format('NOS %s:%s', this.accessId, auth),
            'Connection': 'close',
            'User-Agent': DEFAULT_USER_AGENT,
            'Host': this.host
        },
        method: 'DELETE',
        // 5 sec
        timeout: 5000
    };

    var req = request(opts, function(err, resp) {
        if (!err && resp.statusCode === 200) {
            cb(null);
        } else {
            if (err) {
                cb(err);
            } else {
                cb(new Error('http ret code' + resp.statusCode));
            }
        }
    });
};

function calc_auth(key, au) {
    var h = crypto.createHmac('sha256', key);
    h.update(au);
    return h.digest('base64');
}

function rfc1123_time() {
    return (new Date()).toUTCString();
}

CONTENT_TYPE_NO_BODY  = 'application/x-www-form-urlencoded; charset=utf-8';

CONTENT_TYPE_OCTET = 'application/octet-stream';

DEFAULT_USER_AGENT = 'NLB Nodejs SDK/Agent';

/*
 * bucket {String} bucket name
 * key {String} file key
 * cb {Function} callback(err)
 *
 * @Return http request
 */
Upload.prototype._upload = function _upload(key, cb,file) {
    var date = rfc1123_time();
    key = qs.escape(key);
    var contentType;
    if(file){
        contentType = file.mimeType;
    } else{
        contentType = CONTENT_TYPE_OCTET
    }
    // {method}\n{content-md5}\n{content-type}\n{date}\n{resource}
    // content-md5 is omitted
    var canonicalized_str = util.format('PUT\n\n%s\n%s\n/%s/%s', contentType, date, this.bucket, key);
    var accessSecret = this.accessSecret;
    var auth = calc_auth(this.accessSecret, canonicalized_str);

    var opts = {

        url: util.format('http://%s:%s/%s/%s', this.host, this.port, this.bucket, key),
        headers: {
            'Date': date,
            'Content-Type': contentType,
            'Authorization': util.format('NOS %s:%s', this.accessId, auth)
        },
        // 10 sec
        timeout: 10000
    };
    //var fileWriteStream = fs.createWriteStream('./tmp/tmpImg`'+Math.floor(Math.random()*10000)+file.filename);
    //file.pipe(fileWriteStream);

    //去掉端口
    var _url = opts.url.replace(":"+this.port,"");//opts.url;
    file.pipe(
        request.put(opts, function (err, resp) {
            cb({err: err, code: resp.statusCode, url: _url});
        })
    )
};


/*
 * bucket {String} bucket name
 * filepath {String} file path
 * key {String} file key
 * cb {Function} callback(err)
 */
Upload.prototype._download = function _download (key, cb) {
    var date = rfc1123_time();

    key = qs.escape(key);
    // {method}\n{content-md5}\n{content-type}\n{date}\n{resource}
    var canonicalized_str = util.format('GET\n\n%s\n%s\n/%s/%s', CONTENT_TYPE_NO_BODY, date, this.bucket, key);
    var auth = calc_auth(this.accessSecret, canonicalized_str);

    var opts = {
        url: util.format('http://%s:%s/%s/%s', this.host, this.port, this.bucket, key),
        headers: {
            'Date': date,
            'Content-Type': CONTENT_TYPE_NO_BODY,
            'Authorization': util.format('NOS %s:%s', this.accessId, auth),
            'Connection': 'close',
            'User-Agent': DEFAULT_USER_AGENT,
            'Host': this.host
        },
        // 10 sec
        timeout: 10000
    };

    var req = request.get(opts, function (err, resp) {
        if (!err && resp.statusCode === 200) {
            cb(null);
        } else {
            if (err) {
                cb(err);
            } else {
                cb(new Error('http ret code' + resp.statusCode));
            }
        }
    });

    return req;
};

// exports
module.exports = Upload;