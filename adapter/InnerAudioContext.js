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
    get volume() {
        var ret = 1.0;
        if (this.audioId !== undefined) {
            ret = audioEngine.getVolume(this.audioId);
        }
        return ret;
    }

    set volume(value) {
        this.inVolume = value;
        if (this.audioId !== undefined) {
            audioEngine.setVolume(this.audioId, value);
        }
    }

    get loop() {
        var ret = false;
        if (this.audioId !== undefined) {
            ret = audioEngine.isLoop(this.audioId);
        }
        return ret;
    }

    set loop(value) {
        this.inLoop = value;
        if (this.audioId !== undefined) {
            audioEngine.setLoop(this.audioId, value);
        }
    }

    get autoplay() {
        return this.inAutoplay;
    }

    set autoplay(value) {
        this.inAutoplay = value;
        if (value) {
            this.play();
        }
    }

    // only read attribute
    get duration() {
        var ret = 0;
        if (this.audioId !== undefined) {
            ret = audioEngine.getDuration(this.audioId);
        }
        return ret;
    }

    get currentTime() {
        var ret = 0;
        if (this.audioId !== undefined) {
            ret = audioEngine.getCurrentTime(this.audioId);
        }
        return ret.toFixed(6);
    }

    get paused() {
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

    get buffered() {
        var ret = 0;
        if (this.audioId !== undefined) {
            if (typeof audioEngine.getBuffered === "function") {
                ret = audioEngine.getBuffered(this.audioId);
            }
        }
        return ret;
    }

    set obeyMuteSwitch(value) {
        if (this.audioId !== undefined) {
            if (typeof audioEngine.setObeyMuteSwitch === "function") {
                audioEngine.setObeyMuteSwitch(this.audioId, value);
            }
        }
    }

    // only read attribute
    get obeyMuteSwitch() {
        var ret = false;
        if (this.audioId !== undefined) {
            if (typeof audioEngine.getObeyMuteSwitch === "function") {
                ret = audioEngine.getObeyMuteSwitch(this.audioId);
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

    pause() {
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

    stop() {
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

    seek(position) {
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

    destroy() {
        audioEngine.end();
        _cbFunctionArrayMap = {};
    }

    onEnded(callback) {
        if (this.endCb === null) {
            this.endCb = callback;
            if (this.audioId !== undefined) {
                audioEngine.setFinishCallback(this.audioId, this.endCb);
            } else {
                console.warn("InnerAudioContext onEnded: currently is no music");
            }
        }
    }

    offEnded(callback) {
        if (this.endCb !== null) {
            this.endCb = null;
        }
    }

    onPlay(callback) {
        if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PLAYING) {
            callback();
            return;
        }
        _pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        _removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PAUSE) {
            callback();
            return;
        }
        _pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        _removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        if (this.isStop) {
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
        if (this.audioId !== undefined) {
            callback();
            return;
        }
        _pushFunctionCallback("onCanplay", callback);
    }

    offCanplay(callback) {
        _removeFunctionCallback("onCanplay", callback);
    }

    onWaiting(callback) {
        if (this.audioId === undefined && this.isWaiting) {
            callback();
            return;
        }
        _pushFunctionCallback("onWaiting", callback);
    }

    offWaiting(callback) {
        _removeFunctionCallback("onWaiting", callback);
    }

    onSeeking(callback) {
        if (this.audioId !== undefined && this.isSeeking) {
            this.isSeeking = false;
            callback();
            return;
        }
        _pushFunctionCallback("onSeeking", callback);
    }

    offSeeking(callback) {
        _removeFunctionCallback("onSeeking", callback);
    }

    onSeeked(callback) {
        if (this.audioId !== undefined && this.isSeeked) {
            this.isSeeked = false;
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
    updateProgress() {
        setTimeout(() => {
            // callback
            var cbArray = _getFunctionCallbackArray("onTimeUpdate");
            if (cbArray !== undefined && this.audioId !== undefined) {
                var playing = audioEngine.getState(this.audioId) === this.PLAYING;
                _onFunctionCallback(cbArray);
                if (playing === false) {
                    this.shouldUpdate = false;
                }
            }
            // update
            if (this.shouldUpdate === true) {
                this.updateProgress();
            }
        }, 500);
    }

    beginUpdateProgress() {
        if (this.shouldUpdate === true) {
            return;
        }
        this.shouldUpdate = true;
        this.updateProgress();
    }
}

module.exports = InnerAudioContext;