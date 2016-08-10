
var _={};
_.randString =(function(){
    var _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    return function(_length){
        _length = _length||10;
        var _result = [];
        for(var i=0,_rnum;i<_length;++i){
            _rnum = Math.floor(Math.random()*_chars.length);
            _result.push(_chars.charAt(_rnum));
        }
        return _result.join('');
    };
})();

module.exports = _;