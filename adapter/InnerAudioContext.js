var CbManager = require('./CallbackManager');
var audioEngine;
var rt = loadRuntime();
var _map = new WeakMap();

class InnerAudioContext {

    constructor() {
        audioEngine = rt.AudioEngine;
        var that = this;

        _map.set(this, {
            startTime: 0,
            _src: '',
            _audioId: undefined,
            _endCb: null,
            _WaitingCb: null,
            _errorCb: null,
            _inLoop: false,
            _inVolume: 1.0,
            _inAutoplay: false,
            _isStop: false,
            _isSeeking: false,
            _isSeeked: false,
            _PLAYING: 1,
            _PAUSE: 2,
            _shouldUpdate: false,
            _updateProgress: function () {
                setTimeout(() => {
                    // callback)
                    var cbArray = _map.get(that)["_cbManager"].getFunctionCallbackArray("onTimeUpdate");
                    if (cbArray !== undefined && _map.get(that)['_audioId'] !== undefined) {
                        var playing = audioEngine.getState(_map.get(that)['_audioId']) === _map.get(that)['_PLAYING'];
                        _map.get(that)["_cbManager"].onFunctionCallback(cbArray);
                        if (playing === false) {
                            _map.get(that)['_shouldUpdate'] = false;
                        }
                    }
                    // update
                    if (_map.get(that)['_shouldUpdate'] === true) {
                        _map.get(that)['_updateProgress']();
                    }
                }, 500);
            },

            _beginUpdateProgress: function () {
                if (_map.get(that)['_shouldUpdate'] === true) {
                    return;
                }
                _map.get(that)['_shouldUpdate'] = true;
                _map.get(that)['_updateProgress']();
            },
            _cbManager: new CbManager(),
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
        // clear audioId, create new instance
        if (_map.get(this)['_audioId'] !== undefined) {
            audioEngine.stop(_map.get(this)['_audioId']);
            _map.get(this)['_audioId'] = undefined;
        }
        _map.get(this)['_src'] = value;
        var _this = this;
        // error
        _map.get(this)['_ErrorCb'] = function (param) {
            var cbArrayError = _map.get(_this)["_cbManager"].getFunctionCallbackArray("onError");
            if (cbArrayError !== undefined) {
                var res = { errMsg: param.errMsg, errCode: param.errCode };
                _map.get(_this)["_cbManager"].onFunctionCallback(cbArrayError, res);
                return;
            }
        }
        // preload
        audioEngine.preload(value, function (loaded, errObj) {
            if (loaded === false) {
                var errCb = _map.get(_this)['_ErrorCb'];
                var retObj = {
                    errCode: 10001,
                    errMsg: "system error: play audio error"
                };
                if (errObj !== undefined) {
                    retObj.errCode = errObj.errCode;
                    retObj.errMsg = errObj.errMsg;
                }
                errCb(retObj)
            } else {
                var cbArray = _map.get(_this)["_cbManager"].getFunctionCallbackArray("onCanplay");
                if (cbArray !== undefined) {
                    _map.get(_this)["_cbManager"].onFunctionCallback(cbArray);
                }
            }
        });
        // waiting
        var cbArrayWaiting = _map.get(this)['_WaitingCb']
        if (cbArrayWaiting !== null) {
            cbArrayWaiting();
        }
        if (_map.get(this)['_inAutoplay']) {
            this.play();
            return;
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

    get startTime() {
        return _map.get(this)['startTime'];
    }

    set startTime(value) {
        _map.get(this)['startTime'] = value;
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
                _map.get(this)['_beginUpdateProgress']();
            } else {
                console.warn("InnerAudioContext resume: currently is no music");
            }
        } else {
            if (_map.get(this)['_audioId'] === undefined) {
                _map.get(this)['_audioId'] = audioEngine.play(_map.get(this)['_src'], _map.get(this)['_inLoop'], _map.get(this)['_inVolume']);
                var cbArrayError = _map.get(this)["_cbManager"].getFunctionCallbackArray("onError");
                if (cbArrayError !== undefined && _map.get(this)['_audioId'] === -1) {
                    var res = { errMsg: "System error: create audio error or audio instance is out of limit", errCode: 10001 };
                    _map.get(this)["_cbManager"].onFunctionCallback(cbArrayError, res);
                    return;
                }
                if (typeof _map.get(this)['startTime'] === "number" && _map.get(this)['startTime'] > 0) {
                    audioEngine.setCurrentTime(_map.get(this)['_audioId'], _map.get(this)['startTime']);
                }
                _map.get(this)['_isStop'] = false;

                var cbArray2 = _map.get(this)["_cbManager"].getFunctionCallbackArray("onPlay");
                if (cbArray2 !== undefined) {
                    _map.get(this)["_cbManager"].onFunctionCallback(cbArray2);
                }

                if (cbArrayError !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === -1) {
                    var res = { errMsg: "Network error", errCode: 10002 };
                    _map.get(this)["_cbManager"].onFunctionCallback(cbArrayError, res);
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

        if (_map.get(this)['_audioId'] !== undefined && typeof audioEngine.setErrorCallback === 'function') {
            audioEngine.setErrorCallback(_map.get(this)['_audioId'], _map.get(this)['_ErrorCb']);
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

        var cbArray = _map.get(this)["_cbManager"].getFunctionCallbackArray("onPause");
        if (cbArray !== undefined) {
            _map.get(this)["_cbManager"].onFunctionCallback(cbArray);
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

        var cbArray = _map.get(this)["_cbManager"].getFunctionCallbackArray("onStop");
        if (cbArray !== undefined) {
            _map.get(this)["_cbManager"].onFunctionCallback(cbArray);
        }
    }

    seek(position) {
        if (_map.get(this)['_audioId'] !== undefined) {
            _map.get(this)['_isSeeking'] = true;
            _map.get(this)['_isSeeked'] = true;

            var cbArray = _map.get(this)["_cbManager"].getFunctionCallbackArray("onSeeking");
            if (cbArray !== undefined) {
                _map.get(this)["_cbManager"].onFunctionCallback(cbArray);
            }

            audioEngine.setCurrentTime(_map.get(this)['_audioId'], position);

            var cbArray2 = _map.get(this)["_cbManager"].getFunctionCallbackArray("onSeeked");
            if (cbArray2 !== undefined) {
                _map.get(this)["_cbManager"].onFunctionCallback(cbArray2);
            }

        } else {
            console.warn("InnerAudioContext seek: currently is no music");
        }
    }

    destroy() {
        this.stop();
        _map.get(this)["_cbManager"].cbFunctionArrayMap = {};
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
        _map.get(this)["_cbManager"].pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        if (_map.get(this)['_audioId'] !== undefined && audioEngine.getState(_map.get(this)['_audioId']) === _map.get(this)['_PAUSE']) {
            callback();
            return;
        }
        _map.get(this)["_cbManager"].pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        if (_map.get(this)['_isStop']) {
            callback();
            return;
        }
        _map.get(this)["_cbManager"].pushFunctionCallback("onStop", callback);
    }

    offStop(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onStop", callback);
    }

    onError(callback) {
        _map.get(this)["_cbManager"].pushFunctionCallback("onError", callback);
    }

    offError(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onError", callback);
    }

    onCanplay(callback) {
        _map.get(this)["_cbManager"].pushFunctionCallback("onCanplay", callback);
    }

    offCanplay(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onCanplay", callback);
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
        _map.get(this)["_cbManager"].pushFunctionCallback("onSeeking", callback);
    }

    offSeeking(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onSeeking", callback);
    }

    onSeeked(callback) {
        if (_map.get(this)['_audioId'] !== undefined && _map.get(this)['_isSeeked']) {
            _map.get(this)['_isSeeked'] = false;
            callback();
            return;
        }
        _map.get(this)["_cbManager"].pushFunctionCallback("onSeeked", callback);
    }

    offSeeked(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onSeeked", callback);
    }

    onTimeUpdate(callback) {
        _map.get(this)["_cbManager"].pushFunctionCallback("onTimeUpdate", callback);
    }

    offTimeUpdate(callback) {
        _map.get(this)["_cbManager"].removeFunctionCallback("onTimeUpdate", callback);
    }

}

module.exports = InnerAudioContext;