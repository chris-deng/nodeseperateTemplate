var https = require('https');
var qs = require('querystring');
var _ = require('lodash');
var config = require('config');
var crypto = require('crypto');

var associateParam = {
    'openid.mode':'associate',
    'openid.assoc_type':'HMAC-SHA256',
    'openid.session_type':'no-encryption'
};
var reqOpt = {
    hostname:'login.netease.com',
    path:'/openid/',
    method:'POST',
    headers:{
        'Content-length':0
    }
};

var authParam = {
    'openid.ns':'http://specs.openid.net/auth/2.0',
    'openid.mode':'checkid_setup',
    'openid.claimed_id':'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.identity':'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.ns.sreg':'http://openid.net/extensions/sreg/1.1',
    'openid.sreg.required':'nickname,email,fullname'
};

function getUrl(host) {
    host = host || config.link;
    var opt = _.clone(reqOpt);
    opt.path += '?' + qs.stringify(associateParam);
    return new Promise(function(resolve, reject) {
        var req = https.request(opt, res => {
            var bufs = [];
            res.on('data', buf => bufs.push(buf));
            res.on('end', () => {
                var params = Buffer.concat(bufs).toString().split('\n');
                var query = qs.stringify(_.assign({
                    'openid.assoc_handle': params[0].split(':')[1],
                    'openid.return_to': host + '/callback',
                    'openid.realm': host
                }, authParam));
                var url = 'https://' + reqOpt.hostname + reqOpt.path + '?' + query;
                resolve({
                    url: url,
                    key: params[3].split(':')[1]
                });
            });
        });
        req.end();
        req.on('error', reject);
    });
}

module.exports = function login() {
    return function*(next) {
        if(this.path == '/callback') {
            var key = new Buffer(this.session.key, 'base64');
            var email = this.query['openid.sreg.email'];
            var name = this.query['openid.sreg.fullname'];
            var content = this.query['openid.signed'].split(',')
                    .map(key => `${key}:${this.query['openid.' + key]}`)
                    .join('\n') + '\n';

            var digest = crypto.createHmac('sha256', key)
                .update(new Buffer(content)).digest('base64');

            if(digest == this.query['openid.sig']) {
                this.session.user = { name: name, email:email };
            }
            this.redirect(this.session.referer);
        } else if ( this.path == '/logout' ) {
            this.session.user = null;
            this.redirect('/');
        } else if(this.session.user) {
            this.state.user = this.session.user;
            yield next;
        } else {
            var info = yield getUrl(this.request.origin);
            this.session.referer = this.path;
            this.session.key = info.key;
            this.redirect(info.url);
        }
    };
};