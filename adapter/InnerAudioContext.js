var audioEngine;
var rt = loadRuntime();
var _cbFunctionArrayMap = {};
var _map = new WeakMap();

// callback function tool
var _pushFunctionCallback = function (name, cb) {
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

var _removeFunctionCallback = function (name, cb) {
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

var _getFunctionCallbackArray = function (name) {
    var arr = _cbFunctionArrayMap[name];
    if (arr === undefined) {
        return undefined;
    }
    return arr;
}

var _onFunctionCallback = function (cbFunctionArray) {
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

class InnerAudioContext {

    constructor() {
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
            _shouldUpdate: false
        });
    }

    // read-write attribute
    get src() {
        return _map.get(this)['_src'];
    }

    set src(value) {
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

    get volume() {
        var ret = 1.0;
        if (_map.get(this)['_audioId'] !== undefined) {
            ret = audioEngine.getVolume(_map.get(this)['_audioId']);
        }
        return ret;
    }

    set volume(value) {
        _map.get(this)['_inVolume'] = value;
        if (_map.get(this)['_audioId'] !== undefined) {
            audioEngine.setVolume(_map.get(this)['_audioId'], value);
        }
    }

    get loop() {
        var ret = false;
        if (_map.get(this)['_audioId'] !== undefined) {
            ret = audioEngine.isLoop(_map.get(this)['_audioId']);
        }
        return ret;
    }

    set loop(value) {
        _map.get(this)['_inLoop'] = value;
        if (_map.get(this)['_audioId'] !== undefined) {
            audioEngine.setLoop(_map.get(this)['_audioId'], value);
        }
    }

    get autoplay() {
        return _map.get(this)['_inAutoplay'];
    }

    set autoplay(value) {
        _map.get(this)['_inAutoplay'] = value;
    }

    // only read attribute
    get duration() {
        var ret = 0;
        if (_map.get(this)['_audioId'] !== undefined) {
            ret = audioEngine.getDuration(_map.get(this)['_audioId']);
        }
        return ret;
    }

    get currentTime() {
        var ret = 0;
        if (_map.get(this)['_audioId'] !== undefined) {
            ret = audioEngine.getCurrentTime(_map.get(this)['_audioId']);
        }
        return ret.toFixed(6);
    }

    get paused() {
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

    get buffered() {
        var ret = 0;
        if (_map.get(this)['_audioId'] !== undefined) {
            if (typeof audioEngine.getBuffered === "function") {
                ret = audioEngine.getBuffered(_map.get(this)['_audioId']);
            }
        }
        return ret;
    }

    set obeyMuteSwitch(value) {
        if (_map.get(this)['_audioId'] !== undefined) {
            if (typeof audioEngine.setObeyMuteSwitch === "function") {
                audioEngine.setObeyMuteSwitch(_map.get(this)['_audioId'], value);
            }
        }
    }

    // only read attribute
    get obeyMuteSwitch() {
        var ret = false;
        if (_map.get(this)['_audioId'] !== undefined) {
            if (typeof audioEngine.getObeyMuteSwitch === "function") {
                ret = audioEngine.getObeyMuteSwitch(_map.get(this)['_audioId']);
            }
        }
        return ret;
    }

    // function
    play() {
        if (_map.get(this)['_src'] === "") {
            console.error("InnerAudioContext play: please define src before play");
            return;
        }

        if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PAUSE']) {
            if (_map.get(this)['_audioId'] !== undefined) {
                audioEngine.resume(_map.get(this)['_audioId']);
                this._beginUpdateProgress();
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

                this._beginUpdateProgress();

            } else if (_map.get(this)['_audioId'] !== undefined && this.loop === false && audioEngine.getState(_map.get(this)['_audioId']) !== _map.get(this)['_PLAYING']) {
                _map.get(this)['_audioId'] = undefined;
                _map.get(this)['_audioId'] = audioEngine.play(_map.get(this)['_src'], this.loop, _map.get(this)['_inVolume']);
                if (typeof _map.get(this)['startTime'] === "number" && _map.get(this)['startTime'] > 0) {
                    audioEngine.setCurrentTime(_map.get(this)['_audioId'], _map.get(this)['startTime']);
                }
                this._beginUpdateProgress();
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

    pause() {
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

    stop() {
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

    seek(position) {
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

    destroy() {
        audioEngine.end();
        _cbFunctionArrayMap = {};
    }

    onEnded(callback) {
        if (_map.get(this)['_endCb'] === null) {
            _map.get(this)['_endCb'] = callback;
            if (_map.get(this)['_audioId'] !== undefined) {
                audioEngine.setFinishCallback(_map.get(this)['_audioId'], _map.get(this)['_endCb']);
            } else {
                console.warn("InnerAudioContext onEnded: currently is no music");
            }
        }
    }

    offEnded(callback) {
        if (_map.get(this)['_endCb'] !== null) {
            _map.get(this)['_endCb'] = null;
        }
    }

    onPlay(callback) {
        if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PLAYING']) {
            callback();
            return;
        }
        _pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        _removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PAUSE']) {
            callback();
            return;
        }
        _pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        _removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        if (_map.get(this)['_isStop']) {
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
        if (_map.get(this)['_audioId'] !== undefined) {
            callback();
            return;
        }
        _pushFunctionCallback("onCanplay", callback);
    }

    offCanplay(callback) {
        _removeFunctionCallback("onCanplay", callback);
    }

    onWaiting(callback) {
        if (_map.get(this)['_WaitingCb'] === null) {
            _map.get(this)['_WaitingCb'] = callback;
            if (_map.get(this)['_audioId'] !== undefined) {
                audioEngine.setWaitingCallback(_map.get(this)['_audioId'], _map.get(this)['_WaitingCb']);
            } else {
                console.warn("InnerAudioContext onWaiting: currently is no music");
            }
        }
    }

    offWaiting(callback) {
        if (_map.get(this)['_WaitingCb'] !== null) {
            _map.get(this)['_WaitingCb'] = null;
        }
    }

    onSeeking(callback) {
        if (_map.get(this)['_audioId'] !== undefined && _map.get(this)['_isSeeking']) {
            _map.get(this)['_isSeeking'] = false;
            callback();
            return;
        }
        _pushFunctionCallback("onSeeking", callback);
    }

    offSeeking(callback) {
        _removeFunctionCallback("onSeeking", callback);
    }

    onSeeked(callback) {
        if (_map.get(this)['_audioId'] !== undefined && _map.get(this)['_isSeeked']) {
            _map.get(this)['_isSeeked'] = false;
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

    //private
    _updateProgress() {
        setTimeout(() => {
            // callback
            var cbArray = _getFunctionCallbackArray("onTimeUpdate");
            if (cbArray !== undefined && _map.get(this)['_audioId'] !== undefined) {
                var playing = audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PLAYING'];
                _onFunctionCallback(cbArray);
                if (playing === false) {
                    _map.get(this)['_shouldUpdate'] = false;
                }
            }
            // update
            if (_map.get(this)['_shouldUpdate'] === true) {
                this._updateProgress();
            }
        }, 500);
    }

    _beginUpdateProgress() {
        if (_map.get(this)['_shouldUpdate'] === true) {
            return;
        }
        _map.get(this)['_shouldUpdate'] = true;
        this._updateProgress();
    }
}

module.exports = InnerAudioContext;