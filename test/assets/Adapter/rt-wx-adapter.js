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
        this.src = null;
        this.audioId = undefined;
        this.endCb = null;
        this.inLoop = false;
        this.inVolume = 1.0;
        this.inAutoplay = false;
        this.isStop = false;
        this.isWaiting = false;
        this.isSeeking = false;
        this.isSeeked = false;
        this.PLAYING = 1;
        this.PAUSE = 2;
        this.shouldUpdate = false;
    }

    // read-write attribute


    _createClass(InnerAudioContext, [{
        key: "play",


        // function
        value: function play() {
            if (this.src === null) {
                console.error("InnerAudioContext play: please define src before play");
                return;
            }

            if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PAUSE) {
                if (this.audioId !== undefined) {
                    audioEngine.resume(this.audioId);
                    this.beginUpdateProgress();
                } else {
                    console.warn("InnerAudioContext resume: currently is no music");
                }
            } else {
                if (this.audioId === undefined) {
                    var cbArray = _getFunctionCallbackArray("onCanplay");
                    if (cbArray !== undefined) {
                        _onFunctionCallback(cbArray);
                    }

                    this.audioId = audioEngine.play(this.src, this.inLoop, this.inVolume);
                    if (typeof this.startTime === "number" && this.startTime > 0) {
                        audioEngine.setCurrentTime(this.audioId, this.startTime);
                    }
                    this.isStop = false;

                    var cbArray2 = _getFunctionCallbackArray("onPlay");
                    if (cbArray2 !== undefined) {
                        _onFunctionCallback(cbArray2);
                    }

                    this.beginUpdateProgress();
                } else if (this.audioId !== undefined && this.loop === false && audioEngine.getState(this.audioId) !== this.PLAYING) {
                    this.audioId = undefined;
                    this.audioId = audioEngine.play(this.src, this.loop, this.inVolume);
                    if (typeof this.startTime === "number" && this.startTime > 0) {
                        audioEngine.setCurrentTime(this.audioId, this.startTime);
                    }
                    this.beginUpdateProgress();
                } else {
                    return;
                }
            }

            if (this.audioId !== undefined) {
                if (this.endCb !== null) {
                    audioEngine.setFinishCallback(this.audioId, this.endCb);
                }
            }
        }
    }, {
        key: "pause",
        value: function pause() {
            if (this.audioId !== undefined) {
                if (audioEngine.getState(this.audioId) !== this.PAUSE) {
                    audioEngine.pause(this.audioId);
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
            if (this.audioId !== undefined) {
                audioEngine.stop(this.audioId);
                this.audioId = undefined;
                this.isStop = true;
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
            if (this.audioId !== undefined) {
                this.isSeeking = true;
                this.isSeeked = true;

                var cbArray = _getFunctionCallbackArray("onSeeking");
                if (cbArray !== undefined) {
                    _onFunctionCallback(cbArray);
                }

                audioEngine.setCurrentTime(this.audioId, position);

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
            if (this.endCb === null) {
                this.endCb = callback;
                if (this.audioId !== undefined) {
                    audioEngine.setFinishCallback(this.audioId, this.endCb);
                } else {
                    console.warn("InnerAudioContext onEnded: currently is no music");
                }
            }
        }
    }, {
        key: "offEnded",
        value: function offEnded(callback) {
            if (this.endCb !== null) {
                this.endCb = null;
            }
        }
    }, {
        key: "onPlay",
        value: function onPlay(callback) {
            if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PLAYING) {
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
            if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PAUSE) {
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
            if (this.isStop) {
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
            if (this.audioId !== undefined) {
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
            if (this.audioId === undefined && this.isWaiting) {
                callback();
                return;
            }
            _pushFunctionCallback("onWaiting", callback);
        }
    }, {
        key: "offWaiting",
        value: function offWaiting(callback) {
            _removeFunctionCallback("onWaiting", callback);
        }
    }, {
        key: "onSeeking",
        value: function onSeeking(callback) {
            if (this.audioId !== undefined && this.isSeeking) {
                this.isSeeking = false;
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
            if (this.audioId !== undefined && this.isSeeked) {
                this.isSeeked = false;
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
        key: "updateProgress",
        value: function updateProgress() {
            var _this = this;

            setTimeout(function () {
                // callback
                var cbArray = _getFunctionCallbackArray("onTimeUpdate");
                if (cbArray !== undefined && _this.audioId !== undefined) {
                    var playing = audioEngine.getState(_this.audioId) === _this.PLAYING;
                    _onFunctionCallback(cbArray);
                    if (playing === false) {
                        _this.shouldUpdate = false;
                    }
                }
                // update
                if (_this.shouldUpdate === true) {
                    _this.updateProgress();
                }
            }, 500);
        }
    }, {
        key: "beginUpdateProgress",
        value: function beginUpdateProgress() {
            if (this.shouldUpdate === true) {
                return;
            }
            this.shouldUpdate = true;
            this.updateProgress();
        }
    }, {
        key: "volume",
        get: function get() {
            var ret = 1.0;
            if (this.audioId !== undefined) {
                ret = audioEngine.getVolume(this.audioId);
            }
            return ret;
        },
        set: function set(value) {
            this.inVolume = value;
            if (this.audioId !== undefined) {
                audioEngine.setVolume(this.audioId, value);
            }
        }
    }, {
        key: "loop",
        get: function get() {
            var ret = false;
            if (this.audioId !== undefined) {
                ret = audioEngine.isLoop(this.audioId);
            }
            return ret;
        },
        set: function set(value) {
            this.inLoop = value;
            if (this.audioId !== undefined) {
                audioEngine.setLoop(this.audioId, value);
            }
        }
    }, {
        key: "autoplay",
        get: function get() {
            return this.inAutoplay;
        },
        set: function set(value) {
            this.inAutoplay = value;
            if (value) {
                this.play();
            }
        }

        // only read attribute

    }, {
        key: "duration",
        get: function get() {
            var ret = 0;
            if (this.audioId !== undefined) {
                ret = audioEngine.getDuration(this.audioId);
            }
            return ret;
        }
    }, {
        key: "currentTime",
        get: function get() {
            var ret = 0;
            if (this.audioId !== undefined) {
                ret = audioEngine.getCurrentTime(this.audioId);
            }
            return ret.toFixed(6);
        }
    }, {
        key: "paused",
        get: function get() {
            var ret = false;
            if (this.audioId !== undefined) {
                if (audioEngine.getState(this.audioId) === this.PAUSE) {
                    ret = true;
                }
            }
            if (this.isStop) {
                ret = true;
            }
            return ret;
        }
    }, {
        key: "buffered",
        get: function get() {
            var ret = 0;
            if (this.audioId !== undefined) {
                if (typeof audioEngine.getBuffered === "function") {
                    ret = audioEngine.getBuffered(this.audioId);
                }
            }
            return ret;
        }
    }, {
        key: "obeyMuteSwitch",
        set: function set(value) {
            if (this.audioId !== undefined) {
                if (typeof audioEngine.setObeyMuteSwitch === "function") {
                    audioEngine.setObeyMuteSwitch(this.audioId, value);
                }
            }
        }

        // only read attribute
        ,
        get: function get() {
            var ret = false;
            if (this.audioId !== undefined) {
                if (typeof audioEngine.getObeyMuteSwitch === "function") {
                    ret = audioEngine.getObeyMuteSwitch(this.audioId);
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
