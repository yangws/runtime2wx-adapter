(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var audioEngine;
var rt = loadRuntime();
var _cbFunctionArrayMap = {};
var _map = new WeakMap();

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

        _map.set(this, {
            startTime: 0,
            _src: '',
            _audioId: undefined,
            _endCb: null,
            _WaitingCb: null,
            _inLoop: false,
            _inVolume: 1.0,
            _inAutoplay: false,
            _isStop: false,
            _isSeeking: false,
            _isSeeked: false,
            _PLAYING: 1,
            _PAUSE: 2,
            _shouldUpdate: false,
            _updateProgress: function _updateProgress() {
                var _this = this;

                setTimeout(function () {
                    // callback
                    var cbArray = _getFunctionCallbackArray("onTimeUpdate");
                    if (cbArray !== undefined && _map.get(_this)['_audioId'] !== undefined) {
                        var playing = audioEngine.getState(_map.get(_this)['_audioId']) === _map.get(_this)['_PLAYING'];
                        _onFunctionCallback(cbArray);
                        if (playing === false) {
                            _map.get(_this)['_shouldUpdate'] = false;
                        }
                    }
                    // update
                    if (_map.get(_this)['_shouldUpdate'] === true) {
                        _map.get(_this)['_updateProgress']();
                    }
                }, 500);
            },

            _beginUpdateProgress: function _beginUpdateProgress() {
                if (_map.get(this)['_shouldUpdate'] === true) {
                    return;
                }
                _map.get(this)['_shouldUpdate'] = true;
                _map.get(this)['_updateProgress']();
            }
        });
    }

    // read-write attribute


    _createClass(InnerAudioContext, [{
        key: "play",


        // function
        value: function play() {
            if (_map.get(this)['_src'] === "") {
                console.error("InnerAudioContext play: please define src before play");
                return;
            }

            if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PAUSE']) {
                if (_map.get(this)['_audioId'] !== undefined) {
                    audioEngine.resume(_map.get(this)['_audioId']);
                    _map.get(this)['_beginUpdateProgress']();
                } else {
                    console.warn("InnerAudioContext resume: currently is no music");
                }
            } else {
                if (_map.get(this)['_audioId'] === undefined) {
                    _map.get(this)['_audioId'] = audioEngine.play(_map.get(this)['_src'], _map.get(this)['_inLoop'], _map.get(this)['_inVolume']);
                    var cbArrayError = _getFunctionCallbackArray("onError");
                    if (cbArrayError !== undefined && _map.get(this)['_audioId'] === -1) {
                        var res = { errMsg: "System error: create audio error or audio instance is out of limit", errCode: 10001 };
                        _onFunctionCallback(cbArrayError, res);
                        return;
                    }
                    if (typeof _map.get(this)['startTime'] === "number" && _map.get(this)['startTime'] > 0) {
                        audioEngine.setCurrentTime(_map.get(this)['_audioId'], _map.get(this)['startTime']);
                    }
                    _map.get(this)['_isStop'] = false;

                    var cbArray2 = _getFunctionCallbackArray("onPlay");
                    if (cbArray2 !== undefined) {
                        _onFunctionCallback(cbArray2);
                    }

                    if (cbArrayError !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === -1) {
                        var res = { errMsg: "Network error", errCode: 10002 };
                        _onFunctionCallback(cbArrayError, res);
                    }

                    _map.get(this)['_beginUpdateProgress']();
                } else if (_map.get(this)['_audioId'] !== undefined && this.loop === false && audioEngine.getState(_map.get(this)['_audioId']) !== _map.get(this)['_PLAYING']) {
                    _map.get(this)['_audioId'] = undefined;
                    _map.get(this)['_audioId'] = audioEngine.play(_map.get(this)['_src'], this.loop, _map.get(this)['_inVolume']);
                    if (typeof _map.get(this)['startTime'] === "number" && _map.get(this)['startTime'] > 0) {
                        audioEngine.setCurrentTime(_map.get(this)['_audioId'], _map.get(this)['startTime']);
                    }
                    _map.get(this)['_beginUpdateProgress']();
                } else {
                    return;
                }
            }

            if (_map.get(this)['_audioId'] !== undefined) {
                if (_map.get(this)['_WaitingCb'] !== null) {
                    audioEngine.setWaitingCallback(_map.get(this)['_audioId'], _map.get(this)['_WaitingCb']);
                }
            }

            if (_map.get(this)['_audioId'] !== undefined) {
                if (_map.get(this)['_endCb'] !== null) {
                    audioEngine.setFinishCallback(_map.get(this)['_audioId'], _map.get(this)['_endCb']);
                }
            }
        }
    }, {
        key: "pause",
        value: function pause() {
            if (_map.get(this)['_audioId'] !== undefined) {
                if (audioEngine.getState(_map.get(this)['_audioId']) !== _map.get(this)['_PAUSE']) {
                    audioEngine.pause(_map.get(this)['_audioId']);
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
            if (_map.get(this)['_audioId'] !== undefined) {
                audioEngine.stop(_map.get(this)['_audioId']);
                _map.get(this)['_audioId'] = undefined;
                _map.get(this)['_isStop'] = true;
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
            if (_map.get(this)['_audioId'] !== undefined) {
                _map.get(this)['_isSeeking'] = true;
                _map.get(this)['_isSeeked'] = true;

                var cbArray = _getFunctionCallbackArray("onSeeking");
                if (cbArray !== undefined) {
                    _onFunctionCallback(cbArray);
                }

                audioEngine.setCurrentTime(_map.get(this)['_audioId'], position);

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
            if (_map.get(this)['_endCb'] === null) {
                _map.get(this)['_endCb'] = callback;
                if (_map.get(this)['_audioId'] !== undefined) {
                    audioEngine.setFinishCallback(_map.get(this)['_audioId'], _map.get(this)['_endCb']);
                } else {
                    console.warn("InnerAudioContext onEnded: currently is no music");
                }
            }
        }
    }, {
        key: "offEnded",
        value: function offEnded(callback) {
            if (_map.get(this)['_endCb'] !== null) {
                _map.get(this)['_endCb'] = null;
            }
        }
    }, {
        key: "onPlay",
        value: function onPlay(callback) {
            if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PLAYING']) {
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
            if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PAUSE']) {
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
            if (_map.get(this)['_isStop']) {
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
            if (_map.get(this)['_audioId'] !== undefined) {
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
            if (_map.get(this)['_WaitingCb'] === null) {
                _map.get(this)['_WaitingCb'] = callback;
                if (_map.get(this)['_audioId'] !== undefined) {
                    audioEngine.setWaitingCallback(_map.get(this)['_audioId'], _map.get(this)['_WaitingCb']);
                } else {
                    console.warn("InnerAudioContext onWaiting: currently is no music");
                }
            }
        }
    }, {
        key: "offWaiting",
        value: function offWaiting(callback) {
            if (_map.get(this)['_WaitingCb'] !== null) {
                _map.get(this)['_WaitingCb'] = null;
            }
        }
    }, {
        key: "onSeeking",
        value: function onSeeking(callback) {
            if (_map.get(this)['_audioId'] !== undefined && _map.get(this)['_isSeeking']) {
                _map.get(this)['_isSeeking'] = false;
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
            if (_map.get(this)['_audioId'] !== undefined && _map.get(this)['_isSeeked']) {
                _map.get(this)['_isSeeked'] = false;
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
    }, {
        key: "src",
        get: function get() {
            return _map.get(this)['_src'];
        },
        set: function set(value) {
            if (typeof value !== 'string') {
                console.error("InnerAudioContext src: please src define string type");
                return;
            }
            _map.get(this)['_src'] = value;
            if (_map.get(this)['_inAutoplay']) {
                this.play();
                return;
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
            if (_map.get(this)['_audioId'] !== undefined) {
                ret = audioEngine.getVolume(_map.get(this)['_audioId']);
            }
            return ret;
        },
        set: function set(value) {
            _map.get(this)['_inVolume'] = value;
            if (_map.get(this)['_audioId'] !== undefined) {
                audioEngine.setVolume(_map.get(this)['_audioId'], value);
            }
        }
    }, {
        key: "loop",
        get: function get() {
            var ret = false;
            if (_map.get(this)['_audioId'] !== undefined) {
                ret = audioEngine.isLoop(_map.get(this)['_audioId']);
            }
            return ret;
        },
        set: function set(value) {
            _map.get(this)['_inLoop'] = value;
            if (_map.get(this)['_audioId'] !== undefined) {
                audioEngine.setLoop(_map.get(this)['_audioId'], value);
            }
        }
    }, {
        key: "autoplay",
        get: function get() {
            return _map.get(this)['_inAutoplay'];
        },
        set: function set(value) {
            _map.get(this)['_inAutoplay'] = value;
        }

        // only read attribute

    }, {
        key: "duration",
        get: function get() {
            var ret = 0;
            if (_map.get(this)['_audioId'] !== undefined) {
                ret = audioEngine.getDuration(_map.get(this)['_audioId']);
            }
            return ret;
        }
    }, {
        key: "currentTime",
        get: function get() {
            var ret = 0;
            if (_map.get(this)['_audioId'] !== undefined) {
                ret = audioEngine.getCurrentTime(_map.get(this)['_audioId']);
            }
            return ret.toFixed(6);
        }
    }, {
        key: "paused",
        get: function get() {
            var ret = false;
            if (_map.get(this)['_audioId'] !== undefined) {
                if (audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PAUSE']) {
                    ret = true;
                }
            }
            if (_map.get(this)['_isStop']) {
                ret = true;
            }
            return ret;
        }
    }, {
        key: "buffered",
        get: function get() {
            var ret = 0;
            if (_map.get(this)['_audioId'] !== undefined) {
                if (typeof audioEngine.getBuffered === "function") {
                    ret = audioEngine.getBuffered(_map.get(this)['_audioId']);
                }
            }
            return ret;
        }
    }, {
        key: "obeyMuteSwitch",
        set: function set(value) {
            if (_map.get(this)['_audioId'] !== undefined) {
                if (typeof audioEngine.setObeyMuteSwitch === "function") {
                    audioEngine.setObeyMuteSwitch(_map.get(this)['_audioId'], value);
                }
            }
        }

        // only read attribute
        ,
        get: function get() {
            var ret = false;
            if (_map.get(this)['_audioId'] !== undefined) {
                if (typeof audioEngine.getObeyMuteSwitch === "function") {
                    ret = audioEngine.getObeyMuteSwitch(_map.get(this)['_audioId']);
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
