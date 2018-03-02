define(function () {
    //事件对象，可触发、订阅
    var Signal = function (uid) {
        this.callbacks = [];
    };
    Signal.prototype.AddListener = function (callback, scope) {
        if (!callback) return;
        this.callbacks.push({
            callback: callback,
            scope: scope || this
        });
    };
    Signal.prototype.RemoveListener = function (callback, scope) {
        for (var index = this.callbacks.length - 1; index >= 0; index--) {
            if (this.callbacks[index].callback === callback) {
                if (!scope || (scope === this.callbacks[index].scope)) {
                    this.callbacks.splice(index, 1);
                }
            }
        }
    };
    Signal.prototype.Excute = function () {
        for (var index = 0; index < this.callbacks.length; index++) {
            var scope = this.callbacks[index].scope;
            this.callbacks[index].callback.call(scope, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]);
        } 
    };
    return Signal;
});