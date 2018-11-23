(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var audioEngine;
var _audioId = undefined;
var _filePath = null;
var _cbFunctionArrayMap = {};
var _endCb = null;
var _inLoop = false;
var _inVolume = 1.0;
var _inAutoplay = false;
var _isStop = false;
var _isWaiting = false;
var _isSeeking = false;
var _isSeeked = false;
var _PLAYING = 1;
var _PAUSE = 2;
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
var rt = loadRuntime();

var InnerAudioContext = function () {
    function InnerAudioContext() {
        _classCallCheck(this, InnerAudioContext);

        audioEngine = rt.AudioEngine;

        this.startTime = 0;
        this.src = null;
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

            if (this.src.search("http://") !== -1 || this.src.search("https://") !== -1) {

                var fileExist = function () {
                    this.playing();
                }.bind(this);

                var self = this;
                var fileNotExist = function () {
                    var task = rt.downloadFile({
                        url: this.src,
                        filePath: "",
                        success: function success(msg) {
                            _filePath = msg["tempFilePath"];
                            self.playing();
                        },
                        fail: function fail() {
                            console.error("InnerAudioContext play: downloadFile fail");
                            var cbArray = self.getFunctionCallbackArray("onError");
                            if (cbArray !== undefined) {
                                var res = { errMsg: "downloadFile fail", errCode: 10002 };
                                self.onFunctionCallback(cbArray, res);
                            }
                            return;
                        },
                        complete: function complete() {
                            self.isWaiting = false;
                        }
                    });
                    task.onProgressUpdate(function (msg) {
                        if (!self.isWaiting) {
                            self.isWaiting = true;

                            var cbArray = self.getFunctionCallbackArray("onWaiting");
                            if (cbArray !== undefined) {
                                self.onFunctionCallback(cbArray);
                            }
                        }
                    });
                }.bind(this);

                var fileManager = rt.getFileSystemManager();
                fileManager.access({
                    path: _filePath,
                    success: fileExist,
                    fail: fileNotExist
                });
            } else {
                _filePath = this.src;
                this.playing();
            }
        }
    }, {
        key: "playing",
        value: function playing() {
            if (_audioId !== undefined && audioEngine.getState(_audioId) === _PAUSE) {
                if (_audioId !== undefined) {
                    audioEngine.resume(_audioId);
                } else {
                    console.warn("InnerAudioContext resume: currently is no music");
                }
            } else {
                if (_audioId === undefined) {
                    var cbArray = _getFunctionCallbackArray("onCanplay");
                    if (cbArray !== undefined) {
                        _onFunctionCallback(cbArray);
                    }

                    _audioId = audioEngine.play(_filePath, _inLoop, _inVolume);
                    if (typeof this.startTime === "number" && this.startTime > 0) {
                        audioEngine.setCurrentTime(_audioId, this.startTime);
                    }
                    _isStop = false;

                    var cbArray2 = _getFunctionCallbackArray("onPlay");
                    if (cbArray2 !== undefined) {
                        _onFunctionCallback(cbArray2);
                    }
                } else if (_audioId !== undefined && this.loop === false && audioEngine.getState(_audioId) !== _PLAYING) {
                    _audioId = undefined;
                    _audioId = audioEngine.play(_filePath, this.loop, _inVolume);
                } else {
                    return;
                }
            }

            if (_audioId !== undefined) {
                if (_endCb !== null) {
                    audioEngine.setFinishCallback(_audioId, _endCb);
                }
            }
        }
    }, {
        key: "pause",
        value: function pause() {
            if (_audioId !== undefined) {
                if (audioEngine.getState(_audioId) !== _PAUSE) {
                    audioEngine.pause(_audioId);
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
            if (_audioId !== undefined) {
                audioEngine.stop(_audioId);
                _audioId = undefined;
                _isStop = true;
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
            if (_audioId !== undefined) {
                _isSeeking = true;
                _isSeeked = true;

                var cbArray = _getFunctionCallbackArray("onSeeking");
                if (cbArray !== undefined) {
                    _onFunctionCallback(cbArray);
                }

                audioEngine.setCurrentTime(_audioId, position);

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
            if (_endCb === null) {
                _endCb = callback;
                if (_audioId !== undefined) {
                    audioEngine.setFinishCallback(_audioId, _endCb);
                } else {
                    console.warn("InnerAudioContext onEnded: currently is no music");
                }
            }
        }
    }, {
        key: "offEnded",
        value: function offEnded(callback) {
            if (_endCb !== null) {
                _endCb = null;
            }
        }
    }, {
        key: "onPlay",
        value: function onPlay(callback) {
            if (_audioId !== undefined && audioEngine.getState(_audioId) === _PLAYING) {
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
            if (_audioId !== undefined && audioEngine.getState(_audioId) === _PAUSE) {
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
            if (_isStop) {
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
            if (_audioId !== undefined) {
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
            if (_audioId === undefined && _isWaiting) {
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
            if (_audioId !== undefined && _isSeeking) {
                _isSeeking = false;
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
            if (_audioId !== undefined && _isSeeked) {
                _isSeeked = false;
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
        key: "volume",
        get: function get() {
            var ret = 1.0;
            if (_audioId !== undefined) {
                ret = audioEngine.getVolume(_audioId);
            }
            return ret;
        },
        set: function set(value) {
            _inVolume = value;
            if (_audioId !== undefined) {
                audioEngine.setVolume(_audioId, value);
            }
        }
    }, {
        key: "loop",
        get: function get() {
            var ret = false;
            if (_audioId !== undefined) {
                ret = audioEngine.isLoop(_audioId);
            }
            return ret;
        },
        set: function set(value) {
            _inLoop = value;
            if (_audioId !== undefined) {
                audioEngine.setLoop(_audioId, value);
            }
        }
    }, {
        key: "autoplay",
        get: function get() {
            return _inAutoplay;
        },
        set: function set(value) {
            _inAutoplay = value;
            if (value) {
                this.play();
            }
        }

        // only read attribute

    }, {
        key: "duration",
        get: function get() {
            var ret = 0;
            if (_audioId !== undefined) {
                ret = audioEngine.getDuration(_audioId);
            }
            return ret;
        }
    }, {
        key: "currentTime",
        get: function get() {
            var ret = 0;
            if (_audioId !== undefined) {
                ret = audioEngine.getCurrentTime(_audioId);
            }
            return ret;
        }
    }, {
        key: "paused",
        get: function get() {
            var ret = false;
            if (_audioId !== undefined) {
                if (audioEngine.getState(_audioId) === _PAUSE) {
                    ret = true;
                }
            }
            if (_isStop) {
                ret = true;
            }
            return ret;
        }
    }, {
        key: "buffered",
        get: function get() {
            var ret = 0;
            if (_audioId !== undefined) {
                if (typeof audioEngine.getBuffered === "function") {
                    ret = audioEngine.getBuffered(_audioId);
                }
            }
            return ret;
        }
    }, {
        key: "obeyMuteSwitch",
        set: function set(value) {
            if (_audioId !== undefined) {
                if (typeof audioEngine.setObeyMuteSwitch === "function") {
                    audioEngine.setObeyMuteSwitch(_audioId, value);
                }
            }
        }

        // only read attribute
        ,
        get: function get() {
            var ret = false;
            if (_audioId !== undefined) {
                if (typeof audioEngine.getObeyMuteSwitch === "function") {
                    ret = audioEngine.getObeyMuteSwitch(_audioId);
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
