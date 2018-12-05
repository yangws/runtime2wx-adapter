(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var audioEngine;
var rt = loadRuntime();
var _cbFunctionArrayMap = {};

// callback function tool
var _pushFunctionCallback = function _pushFunctionCallback(name, cb) {
    if (typeof name !== "string" || typeof cb !== "function") {
        return;
    }
    var arr = _cbFunctionArrayMap[name];
    if (!Array.isArray(arr)) {
        arr = [];
        _cbFunctionArrayMap[name] = arr;
    }
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === cb) {
            return;
        }
    }
    arr.push(cb);
};

var _removeFunctionCallback = function _removeFunctionCallback(name, cb) {
    var arr = _cbFunctionArrayMap[name];
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

var _getFunctionCallbackArray = function _getFunctionCallbackArray(name) {
    var arr = _cbFunctionArrayMap[name];
    if (arr === undefined) {
        return undefined;
    }
    return arr;
};

var _onFunctionCallback = function _onFunctionCallback(cbFunctionArray) {
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
        } catch (err) {
            errArr.push(err);
        }
    });
    if (errArr.length > 0) {
        throw errArr.join("\n");
    }
};

var InnerAudioContext = function () {
    function InnerAudioContext() {
        _classCallCheck(this, InnerAudioContext);

        audioEngine = rt.AudioEngine;

        this.startTime = 0;
        this._src = "";
        this._audioId = undefined;
        this._endCb = null;
        this._WaitingCb = null;
        this._inLoop = false;
        this._inVolume = 1.0;
        this._inAutoplay = false;
        this._isStop = false;
        this._isSeeking = false;
        this._isSeeked = false;
        this._PLAYING = 1;
        this._PAUSE = 2;
        this._shouldUpdate = false;
    }

    // read-write attribute


    _createClass(InnerAudioContext, [{
        key: "play",


        // function
        value: function play() {
            if (this._src === "") {
                console.error("InnerAudioContext play: please define src before play");
                return;
            }

            if (this._audioId !== undefined && audioEngine.getState(this._audioId) === this._PAUSE) {
                if (this._audioId !== undefined) {
                    audioEngine.resume(this._audioId);
                    this._beginUpdateProgress();
                } else {
                    console.warn("InnerAudioContext resume: currently is no music");
                }
            } else {
                if (this._audioId === undefined) {

                    this._audioId = audioEngine.play(this._src, this._inLoop, this._inVolume);
                    if (typeof this.startTime === "number" && this.startTime > 0) {
                        audioEngine.setCurrentTime(this._audioId, this.startTime);
                    }
                    this._isStop = false;

                    var cbArray2 = _getFunctionCallbackArray("onPlay");
                    if (cbArray2 !== undefined) {
                        _onFunctionCallback(cbArray2);
                    }

                    var cbArray3 = _getFunctionCallbackArray("onError");
                    if (cbArray3 !== undefined && audioEngine.getState(this._audioId) === -1) {
                        var res = { errMsg: "Network error", errCode: 10002 };
                        _onFunctionCallback(cbArray3, res);
                    }

                    this._beginUpdateProgress();
                } else if (this._audioId !== undefined && this.loop === false && audioEngine.getState(this._audioId) !== this._PLAYING) {
                    this._audioId = undefined;
                    this._audioId = audioEngine.play(this._src, this.loop, this._inVolume);
                    if (typeof this.startTime === "number" && this.startTime > 0) {
                        audioEngine.setCurrentTime(this._audioId, this.startTime);
                    }
                    this._beginUpdateProgress();
                } else {
                    return;
                }
            }

            if (this._audioId !== undefined) {
                if (this._WaitingCb !== null) {
                    audioEngine.setWaitingCallback(this._audioId, this._WaitingCb);
                }
            }

            if (this._audioId !== undefined) {
                if (this._endCb !== null) {
                    audioEngine.setFinishCallback(this._audioId, this._endCb);
                }
            }
        }
    }, {
        key: "pause",
        value: function pause() {
            if (this._audioId !== undefined) {
                if (audioEngine.getState(this._audioId) !== this._PAUSE) {
                    audioEngine.pause(this._audioId);
                } else {
                    console.warn("InnerAudioContext pause: currently music was pause");
                }
            } else {
                console.warn("InnerAudioContext pause: currently is no music");
            }

            var cbArray = _getFunctionCallbackArray("onPause");
            if (cbArray !== undefined) {
                _onFunctionCallback(cbArray);
            }
        }
    }, {
        key: "stop",
        value: function stop() {
            if (this._audioId !== undefined) {
                audioEngine.stop(this._audioId);
                this._audioId = undefined;
                this._isStop = true;
            } else {
                console.warn("InnerAudioContext stop: currently is no music");
            }

            var cbArray = _getFunctionCallbackArray("onStop");
            if (cbArray !== undefined) {
                _onFunctionCallback(cbArray);
            }
        }
    }, {
        key: "seek",
        value: function seek(position) {
            if (this._audioId !== undefined) {
                this._isSeeking = true;
                this._isSeeked = true;

                var cbArray = _getFunctionCallbackArray("onSeeking");
                if (cbArray !== undefined) {
                    _onFunctionCallback(cbArray);
                }

                audioEngine.setCurrentTime(this._audioId, position);

                var cbArray2 = _getFunctionCallbackArray("onSeeked");
                if (cbArray2 !== undefined) {
                    _onFunctionCallback(cbArray2);
                }
            } else {
                console.warn("InnerAudioContext seek: currently is no music");
            }
        }
    }, {
        key: "destroy",
        value: function destroy() {
            audioEngine.end();
            _cbFunctionArrayMap = {};
        }
    }, {
        key: "onEnded",
        value: function onEnded(callback) {
            if (this._endCb === null) {
                this._endCb = callback;
                if (this._audioId !== undefined) {
                    audioEngine.setFinishCallback(this._audioId, this._endCb);
                } else {
                    console.warn("InnerAudioContext onEnded: currently is no music");
                }
            }
        }
    }, {
        key: "offEnded",
        value: function offEnded(callback) {
            if (this._endCb !== null) {
                this._endCb = null;
            }
        }
    }, {
        key: "onPlay",
        value: function onPlay(callback) {
            if (this._audioId !== undefined && audioEngine.getState(this._audioId) === this._PLAYING) {
                callback();
                return;
            }
            _pushFunctionCallback("onPlay", callback);
        }
    }, {
        key: "offPlay",
        value: function offPlay(callback) {
            _removeFunctionCallback("onPlay", callback);
        }
    }, {
        key: "onPause",
        value: function onPause(callback) {
            if (this._audioId !== undefined && audioEngine.getState(this._audioId) === this._PAUSE) {
                callback();
                return;
            }
            _pushFunctionCallback("onPause", callback);
        }
    }, {
        key: "offPause",
        value: function offPause(callback) {
            _removeFunctionCallback("onPause", callback);
        }
    }, {
        key: "onStop",
        value: function onStop(callback) {
            if (this._isStop) {
                callback();
                return;
            }
            _pushFunctionCallback("onStop", callback);
        }
    }, {
        key: "offStop",
        value: function offStop(callback) {
            _removeFunctionCallback("onStop", callback);
        }
    }, {
        key: "onError",
        value: function onError(callback) {
            _pushFunctionCallback("onError", callback);
        }
    }, {
        key: "offError",
        value: function offError(callback) {
            _removeFunctionCallback("onError", callback);
        }
    }, {
        key: "onCanplay",
        value: function onCanplay(callback) {
            if (this._audioId !== undefined) {
                callback();
                return;
            }
            _pushFunctionCallback("onCanplay", callback);
        }
    }, {
        key: "offCanplay",
        value: function offCanplay(callback) {
            _removeFunctionCallback("onCanplay", callback);
        }
    }, {
        key: "onWaiting",
        value: function onWaiting(callback) {
            if (this._WaitingCb === null) {
                this._WaitingCb = callback;
                if (this._audioId !== undefined) {
                    audioEngine.setWaitingCallback(this._audioId, this._WaitingCb);
                } else {
                    console.warn("InnerAudioContext onWaiting: currently is no music");
                }
            }
        }
    }, {
        key: "offWaiting",
        value: function offWaiting(callback) {
            if (this._WaitingCb !== null) {
                this._WaitingCb = null;
            }
        }
    }, {
        key: "onSeeking",
        value: function onSeeking(callback) {
            if (this._audioId !== undefined && this._isSeeking) {
                this._isSeeking = false;
                callback();
                return;
            }
            _pushFunctionCallback("onSeeking", callback);
        }
    }, {
        key: "offSeeking",
        value: function offSeeking(callback) {
            _removeFunctionCallback("onSeeking", callback);
        }
    }, {
        key: "onSeeked",
        value: function onSeeked(callback) {
            if (this._audioId !== undefined && this._isSeeked) {
                this._isSeeked = false;
                callback();
                return;
            }
            _pushFunctionCallback("onSeeked", callback);
        }
    }, {
        key: "offSeeked",
        value: function offSeeked(callback) {
            _removeFunctionCallback("onSeeked", callback);
        }
    }, {
        key: "onTimeUpdate",
        value: function onTimeUpdate(callback) {
            _pushFunctionCallback("onTimeUpdate", callback);
        }
    }, {
        key: "offTimeUpdate",
        value: function offTimeUpdate(callback) {
            _removeFunctionCallback("onTimeUpdate", callback);
        }

        //private

    }, {
        key: "_updateProgress",
        value: function _updateProgress() {
            var _this = this;

            setTimeout(function () {
                // callback
                var cbArray = _getFunctionCallbackArray("onTimeUpdate");
                if (cbArray !== undefined && _this._audioId !== undefined) {
                    var playing = audioEngine.getState(_this._audioId) === _this._PLAYING;
                    _onFunctionCallback(cbArray);
                    if (playing === false) {
                        _this._shouldUpdate = false;
                    }
                }
                // update
                if (_this._shouldUpdate === true) {
                    _this._updateProgress();
                }
            }, 500);
        }
    }, {
        key: "_beginUpdateProgress",
        value: function _beginUpdateProgress() {
            if (this._shouldUpdate === true) {
                return;
            }
            this._shouldUpdate = true;
            this._updateProgress();
        }
    }, {
        key: "src",
        get: function get() {
            return this._src;
        },
        set: function set(value) {
            if (typeof value !== 'string') {
                console.error("InnerAudioContext src: please src define string type");
                return;
            }
            this._src = value;
            if (this._inAutoplay) {
                this.play();
            }
            var cbArray = _getFunctionCallbackArray("onCanplay");
            if (cbArray !== undefined) {
                _onFunctionCallback(cbArray);
            }
        }
    }, {
        key: "volume",
        get: function get() {
            var ret = 1.0;
            if (this._audioId !== undefined) {
                ret = audioEngine.getVolume(this._audioId);
            }
            return ret;
        },
        set: function set(value) {
            this._inVolume = value;
            if (this._audioId !== undefined) {
                audioEngine.setVolume(this._audioId, value);
            }
        }
    }, {
        key: "loop",
        get: function get() {
            var ret = false;
            if (this._audioId !== undefined) {
                ret = audioEngine.isLoop(this._audioId);
            }
            return ret;
        },
        set: function set(value) {
            this._inLoop = value;
            if (this._audioId !== undefined) {
                audioEngine.setLoop(this._audioId, value);
            }
        }
    }, {
        key: "autoplay",
        get: function get() {
            return this._inAutoplay;
        },
        set: function set(value) {
            this._inAutoplay = value;
        }

        // only read attribute

    }, {
        key: "duration",
        get: function get() {
            var ret = 0;
            if (this._audioId !== undefined) {
                ret = audioEngine.getDuration(this._audioId);
            }
            return ret;
        }
    }, {
        key: "currentTime",
        get: function get() {
            var ret = 0;
            if (this._audioId !== undefined) {
                ret = audioEngine.getCurrentTime(this._audioId);
            }
            return ret.toFixed(6);
        }
    }, {
        key: "paused",
        get: function get() {
            var ret = false;
            if (this._audioId !== undefined) {
                if (audioEngine.getState(this._audioId) === this._PAUSE) {
                    ret = true;
                }
            }
            if (this._isStop) {
                ret = true;
            }
            return ret;
        }
    }, {
        key: "buffered",
        get: function get() {
            var ret = 0;
            if (this._audioId !== undefined) {
                if (typeof audioEngine.getBuffered === "function") {
                    ret = audioEngine.getBuffered(this._audioId);
                }
            }
            return ret;
        }
    }, {
        key: "obeyMuteSwitch",
        set: function set(value) {
            if (this._audioId !== undefined) {
                if (typeof audioEngine.setObeyMuteSwitch === "function") {
                    audioEngine.setObeyMuteSwitch(this._audioId, value);
                }
            }
        }

        // only read attribute
        ,
        get: function get() {
            var ret = false;
            if (this._audioId !== undefined) {
                if (typeof audioEngine.getObeyMuteSwitch === "function") {
                    ret = audioEngine.getObeyMuteSwitch(this._audioId);
                }
            }
            return ret;
        }
    }]);

    return InnerAudioContext;
}();

module.exports = InnerAudioContext;

},{}],2:[function(require,module,exports){
'use strict';

(function () {
    var rt = loadRuntime();
    rt.createInnerAudioContext = function () {
        var InnerAudioContext = require('./InnerAudioContext');
        return new InnerAudioContext();
    };
})();

},{"./InnerAudioContext":1}],3:[function(require,module,exports){
'use strict';

require('./adapter/main');

},{"./adapter/main":2}]},{},[3]);
