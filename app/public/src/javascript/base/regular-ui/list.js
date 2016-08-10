var BaseComponent   = require('./ui'),
    _      = require('underscore'),
    ut     = require('base_path/util');


var ListComponent = BaseComponent.extend({
    name: 'list',
    watchedAttr: ['current'],
    config: function (data) {
        _.extendOwn(this.data, {
            total: 1,
            current: 1,
            limit: 10,
            list: [],
            initial:true
        });
        this.supr(data);
        this.$watch(this.watchedAttr, function (newValue,oldValue) {
            if (this.shouldUpdateList(newValue,oldValue)) {
                this.__getList();
            }
        });
    },
    init: function () {
        // 需要自定义复杂的更新策略, $emit('updatelist')事件即可
        this.$on('updatelist', this.__getList.bind(this));

    },
    // @子类修改
    shouldUpdateList: function (newValue,oldValue) {
        return true;
    },
    shouldUpdateTotal:function() {
        var initial = this.data.initial;
        this.data.initial = false;
        return initial;
    },
    getExtraParam: function () {
        return this.data.condition;
    },
    refresh: function (_data) {
        this.data.current = 1;
        this.data.pageNo = 1;
        this.data.condition = _data;
        this.$emit('updatelist');
    },
    getListParam: function () {
        var data = this.data;

        var _obj = _.extendOwn({
            limit: data.limit,
            offset: data.limit * (data.current - 1),
            current: data.current,
            page: data.current
        }, this.getExtraParam(data));
        for (var key in _obj) {
            if (_obj[key] === null || _obj[key] === "" ||　typeof _obj[key] ==='undefined') {
                delete _obj[key];
            }
        }
        return _obj;
    },
    __bodyResolver: function (json) {
        if(!!json){
            this.data.total = json.total || 0;
            this.data.list = json.list || [];
            this.__updateTotals && this.__updateTotals(json.total); // 更新tab上显示的总数
            this.$update();
        }else{
            console.warn("查询列表失败...");
        }
    },
    // update loading
    __getList: function () {
        var url = this.url + '?' + ut.param(this.getListParam());
        var promise = this.$request(url, {
            timeout:8000 //限制8s内响应
        });
        promise.then(function(json) {
                this.__bodyResolver(json);
            }.bind(this)
        );
    }
});

module.exports = ListComponent;