var audioEngine;
var rt = loadRuntime();
var _cbFunctionArrayMap = {};

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

        this.startTime = 0;
        this.src = null;
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
    get volume() {
        var ret = 1.0;
        if (this._audioId !== undefined) {
            ret = audioEngine.getVolume(this._audioId);
        }
        return ret;
    }

    set volume(value) {
        this._inVolume = value;
        if (this._audioId !== undefined) {
            audioEngine.setVolume(this._audioId, value);
        }
    }

    get loop() {
        var ret = false;
        if (this._audioId !== undefined) {
            ret = audioEngine.isLoop(this._audioId);
        }
        return ret;
    }

    set loop(value) {
        this._inLoop = value;
        if (this._audioId !== undefined) {
            audioEngine.setLoop(this._audioId, value);
        }
    }

    get autoplay() {
        return this._inAutoplay;
    }

    set autoplay(value) {
        this._inAutoplay = value;
        if (value) {
            this.play();
        }
    }

    // only read attribute
    get duration() {
        var ret = 0;
        if (this._audioId !== undefined) {
            ret = audioEngine.getDuration(this._audioId);
        }
        return ret;
    }

    get currentTime() {
        var ret = 0;
        if (this._audioId !== undefined) {
            ret = audioEngine.getCurrentTime(this._audioId);
        }
        return ret.toFixed(6);
    }

    get paused() {
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

    get buffered() {
        var ret = 0;
        if (this._audioId !== undefined) {
            if (typeof audioEngine.getBuffered === "function") {
                ret = audioEngine.getBuffered(this._audioId);
            }
        }
        return ret;
    }

    set obeyMuteSwitch(value) {
        if (this._audioId !== undefined) {
            if (typeof audioEngine.setObeyMuteSwitch === "function") {
                audioEngine.setObeyMuteSwitch(this._audioId, value);
            }
        }
    }

    // only read attribute
    get obeyMuteSwitch() {
        var ret = false;
        if (this._audioId !== undefined) {
            if (typeof audioEngine.getObeyMuteSwitch === "function") {
                ret = audioEngine.getObeyMuteSwitch(this._audioId);
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

        if (this._audioId !== undefined && audioEngine.getState(this._audioId) === this._PAUSE) {
            if (this._audioId !== undefined) {
                audioEngine.resume(this._audioId);
                this._beginUpdateProgress();
            } else {
                console.warn("InnerAudioContext resume: currently is no music");
            }
        } else {
            if (this._audioId === undefined) {
                var cbArray = _getFunctionCallbackArray("onCanplay");
                if (cbArray !== undefined) {
                    _onFunctionCallback(cbArray);
                }

                this._audioId = audioEngine.play(this.src, this._inLoop, this._inVolume);
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
                this._audioId = audioEngine.play(this.src, this.loop, this._inVolume);
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

    pause() {
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

    stop() {
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

    seek(position) {
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

    destroy() {
        audioEngine.end();
        _cbFunctionArrayMap = {};
    }

    onEnded(callback) {
        if (this._endCb === null) {
            this._endCb = callback;
            if (this._audioId !== undefined) {
                audioEngine.setFinishCallback(this._audioId, this._endCb);
            } else {
                console.warn("InnerAudioContext onEnded: currently is no music");
            }
        }
    }

    offEnded(callback) {
        if (this._endCb !== null) {
            this._endCb = null;
        }
    }

    onPlay(callback) {
        if (this._audioId !== undefined && audioEngine.getState(this._audioId) === this._PLAYING) {
            callback();
            return;
        }
        _pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        _removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        if (this._audioId !== undefined && audioEngine.getState(this._audioId) === this._PAUSE) {
            callback();
            return;
        }
        _pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        _removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        if (this._isStop) {
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
        if (this._audioId !== undefined) {
            callback();
            return;
        }
        _pushFunctionCallback("onCanplay", callback);
    }

    offCanplay(callback) {
        _removeFunctionCallback("onCanplay", callback);
    }

    onWaiting(callback) {
        if (this._WaitingCb === null) {
            this._WaitingCb = callback;
            if (this._audioId !== undefined) {
                audioEngine.setWaitingCallback(this._audioId, this._WaitingCb);
            } else {
                console.warn("InnerAudioContext onWaiting: currently is no music");
            }
        }
    }

    offWaiting(callback) {
        if (this._WaitingCb !== null) {
            this._WaitingCb = null;
        }
    }

    onSeeking(callback) {
        if (this._audioId !== undefined && this._isSeeking) {
            this._isSeeking = false;
            callback();
            return;
        }
        _pushFunctionCallback("onSeeking", callback);
    }

    offSeeking(callback) {
        _removeFunctionCallback("onSeeking", callback);
    }

    onSeeked(callback) {
        if (this._audioId !== undefined && this._isSeeked) {
            this._isSeeked = false;
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
            if (cbArray !== undefined && this._audioId !== undefined) {
                var playing = audioEngine.getState(this._audioId) === this._PLAYING;
                _onFunctionCallback(cbArray);
                if (playing === false) {
                    this._shouldUpdate = false;
                }
            }
            // update
            if (this._shouldUpdate === true) {
                this._updateProgress();
            }
        }, 500);
    }

    _beginUpdateProgress() {
        if (this._shouldUpdate === true) {
            return;
        }
        this._shouldUpdate = true;
        this._updateProgress();
    }
}

module.exports = InnerAudioContext;