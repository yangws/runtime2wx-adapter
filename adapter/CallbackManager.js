class CallbackManager {
    constructor() {
        this.cbFunctionArrayMap = {};
        var that = this;
        this.pushFunctionCallback = function (name, cb) {
            if (typeof name !== "string" || typeof cb !== "function") {
                return;
            }
            var arr = that.cbFunctionArrayMap[name];
            if (!Array.isArray(arr)) {
                arr = [];
                that.cbFunctionArrayMap[name] = arr;
            }
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] === cb) {
                    return;
                }
            }
            arr.push(cb);
        };
        this.removeFunctionCallback = function (name, cb) {
            var arr = that.cbFunctionArrayMap[name];
            if (arr === undefined) {
                return;
            }
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === cb) {
                    arr.splice(i, 1);
                    break;
                }
            }
        };
        this.getFunctionCallbackArray = function (name) {
            var arr = that.cbFunctionArrayMap[name];
            if (arr === undefined) {
                return undefined;
            }
            return arr;
        };
        this.onFunctionCallback = function (cbFunctionArray) {
            if (cbFunctionArray === undefined) {
                return;
            }
            var argc = arguments.length;
            var args = arguments;
            var errArr = [];

            cbFunctionArray.forEach(function (cb) {
                if (typeof cb !== "function") {
                    return;
                }
                try {
                    switch (argc) {
                        case 1:
                            cb();
                            break;
                        case 2:
                            cb(args[1]);
                            break;
                        case 3:
                            cb(args[1], args[2]);
                            break;
                        case 4:
                            cb(args[1], args[2], args[3]);
                            break;
                        case 5:
                            cb(args[1], args[3], args[3], args[4]);
                            break;
                        case 6:
                            cb(args[1], args[3], args[3], args[4], args[5]);
                            break;
                        case 7:
                            cb(args[1], args[3], args[3], args[4], args[5], args[6]);
                            break;
                        case 8:
                            cb(args[1], args[3], args[3], args[4], args[5], args[6], args[7]);
                            break;
                        case 9:
                            cb(args[1], args[3], args[3], args[4], args[5], args[6], args[7], args[8]);
                            break;
                        case 10:
                            cb(args[1], args[3], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
                            break;
                    }
                }
                catch (err) {
                    errArr.push(err);
                }
            });
            if (errArr.length > 0) {
                throw (errArr.join("\n"));
            }
        };
    }
}

module.exports = CallbackManager;