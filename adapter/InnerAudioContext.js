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
var _playing = function() {
    if (_audioId !== undefined && audioEngine.getState(_audioId) === _PAUSE) {
        if (_audioId !== undefined) {
            audioEngine.resume(_audioId);
            _beginUpdateProgress();
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

            _beginUpdateProgress();

        } else if (_audioId !== undefined && this.loop === false && audioEngine.getState(_audioId) !== _PLAYING) {
            _audioId = undefined;
            _audioId = audioEngine.play(_filePath, this.loop, _inVolume);
            if (typeof this.startTime === "number" && this.startTime > 0) {
                audioEngine.setCurrentTime(_audioId, this.startTime);
            }
            _beginUpdateProgress();
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
// callback function tool
var _pushFunctionCallback = function(name, cb) {
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
}

var _removeFunctionCallback = function(name, cb) {
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
}

var _getFunctionCallbackArray = function(name) {
    var arr = _cbFunctionArrayMap[name];
    if (arr === undefined) {
        return undefined;
    }
    return arr;
}

var _onFunctionCallback = function(cbFunctionArray) {
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
}
var _shouldUpdate = false;
var _updateProgress = function() {
    setTimeout(() => {
        // callback
        var cbArray = _getFunctionCallbackArray("onTimeUpdate");
        if (cbArray !== undefined && _audioId !== undefined) {
            var playing = audioEngine.getState(_audioId) === _PLAYING;
            _onFunctionCallback(cbArray);
            if (playing === false) {
                _shouldUpdate = false;
            }
        }
        // update
        if (_shouldUpdate === true) {
            _updateProgress();
        }
    }, 500);
}
var _beginUpdateProgress = function () {
    if (_shouldUpdate === true) {
        return;
    }
    _shouldUpdate = true;
    _updateProgress();
}
var rt = loadRuntime();

class InnerAudioContext {

    constructor() {
        audioEngine = rt.AudioEngine;

        this.startTime = 0;
        this.src = null;
    }

    // read-write attribute
    get volume() {
        var ret = 1.0;
        if (_audioId !== undefined) {
            ret = audioEngine.getVolume(_audioId);
        }
        return ret;
    }

    set volume(value) {
        _inVolume = value;
        if (_audioId !== undefined) {
            audioEngine.setVolume(_audioId, value);
        }
    }

    get loop() {
        var ret = false;
        if (_audioId !== undefined) {
            ret = audioEngine.isLoop(_audioId);
        }
        return ret;
    }

    set loop(value) {
        _inLoop = value;
        if (_audioId !== undefined) {
            audioEngine.setLoop(_audioId, value);
        }
    }

    get autoplay() {
        return _inAutoplay;
    }

    set autoplay(value) {
        _inAutoplay = value;
        if (value) {
            this.play();
        }
    }

    // only read attribute
    get duration() {
        var ret = 0;
        if (_audioId !== undefined) {
            ret = audioEngine.getDuration(_audioId);
        }
        return ret;
    }

    get currentTime() {
        var ret = 0;
        if (_audioId !== undefined) {
            ret = audioEngine.getCurrentTime(_audioId);
        }
        return ret;
    }

    get paused() {
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

    get buffered() {
        var ret = 0;
        if (_audioId !== undefined) {
            if (typeof audioEngine.getBuffered === "function") {
                ret = audioEngine.getBuffered(_audioId);
            }
        }
        return ret;
    }

    set obeyMuteSwitch(value) {
        if (_audioId !== undefined) {
            if (typeof audioEngine.setObeyMuteSwitch === "function") {
                audioEngine.setObeyMuteSwitch(_audioId, value);
            }
        }
    }

    // only read attribute
    get obeyMuteSwitch() {
        var ret = false;
        if (_audioId !== undefined) {
            if (typeof audioEngine.getObeyMuteSwitch === "function") {
                ret = audioEngine.getObeyMuteSwitch(_audioId);
            }
        }
        return ret;
    }

    // function
    play() {
        if (this.src === null) {
            console.error("InnerAudioContext play: please define src before play");
            return;
        }

        if (this.src.search("http://") !== -1 || this.src.search("https://") !== -1) {

            var fileExist = function () {
                var playing = _playing.bind(this);
                playing();
            }.bind(this);

            var self = this;
            var fileNotExist = function () {
                var task = rt.downloadFile({
                    url: this.src,
                    filePath: "",
                    success(msg) {
                        _filePath = msg["tempFilePath"];
                        var playing = _playing.bind(self);
                        playing();
                    },
                    fail() {
                        console.error("InnerAudioContext play: downloadFile fail");
                        var cbArray = _getFunctionCallbackArray("onError");
                        if (cbArray !== undefined) {
                            var res = { errMsg: "downloadFile fail", errCode: 10002 };
                            _onFunctionCallback(cbArray, res);
                        }
                        return;
                    },
                    complete() {
                        _isWaiting = false;
                    },
                });
                task.onProgressUpdate(function (msg) {
                    if (!_isWaiting) {
                        _isWaiting = true;

                        var cbArray = _getFunctionCallbackArray("onWaiting");
                        if (cbArray !== undefined) {
                            _onFunctionCallback(cbArray);
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
            var playing = _playing.bind(this);
            playing();
        }
    }

    pause() {
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

    stop() {
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

    seek(position) {
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

    destroy() {
        audioEngine.end();
        _cbFunctionArrayMap = {};
    }

    onEnded(callback) {
        if (_endCb === null) {
            _endCb = callback;
            if (_audioId !== undefined) {
                audioEngine.setFinishCallback(_audioId, _endCb);
            } else {
                console.warn("InnerAudioContext onEnded: currently is no music");
            }
        }
    }

    offEnded(callback) {
        if (_endCb !== null) {
            _endCb = null;
        }
    }

    onPlay(callback) {
        if (_audioId !== undefined && audioEngine.getState(_audioId) === _PLAYING) {
            callback();
            return;
        }
        _pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        _removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        if (_audioId !== undefined && audioEngine.getState(_audioId) === _PAUSE) {
            callback();
            return;
        }
        _pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        _removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        if (_isStop) {
            callback();
            return;
        }
        _pushFunctionCallback("onStop", callback);
    }

    offStop(callback) {
        _removeFunctionCallback("onStop", callback);
    }

    onError(callback) {
        _pushFunctionCallback("onError", callback);
    }

    offError(callback) {
        _removeFunctionCallback("onError", callback);
    }

    onCanplay(callback) {
        if (_audioId !== undefined) {
            callback();
            return;
        }
        _pushFunctionCallback("onCanplay", callback);
    }

    offCanplay(callback) {
        _removeFunctionCallback("onCanplay", callback);
    }

    onWaiting(callback) {
        if (_audioId === undefined && _isWaiting) {
            callback();
            return;
        }
        _pushFunctionCallback("onWaiting", callback);
    }

    offWaiting(callback) {
        _removeFunctionCallback("onWaiting", callback);
    }

    onSeeking(callback) {
        if (_audioId !== undefined && _isSeeking) {
            _isSeeking = false;
            callback();
            return;
        }
        _pushFunctionCallback("onSeeking", callback);
    }

    offSeeking(callback) {
        _removeFunctionCallback("onSeeking", callback);
    }

    onSeeked(callback) {
        if (_audioId !== undefined && _isSeeked) {
            _isSeeked = false;
            callback();
            return;
        }
        _pushFunctionCallback("onSeeked", callback);
    }

    offSeeked(callback) {
        _removeFunctionCallback("onSeeked", callback);
    }

    onTimeUpdate(callback) {
        _pushFunctionCallback("onTimeUpdate", callback);
    }

    offTimeUpdate(callback) {
        _removeFunctionCallback("onTimeUpdate", callback);
    }
}

module.exports = InnerAudioContext;