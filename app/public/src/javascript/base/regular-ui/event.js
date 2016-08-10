var event = {};
event.stop = function(event){
    if (!!_event){
        !!_event.stopPropagation
            ? _event.stopPropagation()
            : _event.cancelBubble = !0;
    }
    if (!!_event){
        !!_event.preventDefault
            ? _event.preventDefault()
            : _event.returnValue = !1;
    }
};

module.exports = event;