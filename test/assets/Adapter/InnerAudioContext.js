var audioEngine;

class InnerAudioContext {
    src = null;
    cbFunctionArrayMap = {}
    inLoop = false;
    inVolume = 1.0;
    inAutoplay = false;
    isPause = false;
    audioId = undefined;

    constructor() {
        audioEngine = loadRuntime().AudioEngine;
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
            ret = audioEngine.getDuration(this.audioId)
        }
        return ret;
    }

    get currentTime() {
        var ret = 0;
        if (this.audioId !== undefined) {
            ret = audioEngine.getCurrentTime(this.audioId)
        }
        return ret;
    }

    get paused() {
        var ret = 0;
        if (this.audioId !== undefined) {
            ret = audioEngine.getState(this.audioId)
        }
        return ret;
    }

    // function
    play() {
        if (this.src === null) {
            console.error("InnerAudioContext play: please define src before play");
            return;
        }

        if (!this.isPause) {
            if (this.audioId === undefined) {
                this.audioId = audioEngine.play(this.src, this.inLoop, this.inVolume);
            } else {
                return;
            }
        } else {
            if (this.audioId !== undefined) {
                audioEngine.resume(this.audioId);
                this.isPause = false;
            } else {
                console.warn("InnerAudioContext resume: currently is no music");
            }
        }

        var cbArray = this.getFunctionCallbackArray("onPlay");
        if (cbArray !== undefined) {
            this.onFunctionCallback(cbArray);
        }

        var cbArray2 = this.getFunctionCallbackArray("onError");
        if (cbArray2 !== undefined) {
            this.onFunctionCallback(cbArray2);
        }
    }

    pause() {
        if (this.audioId !== undefined) {
            if (this.isPause === false) {
                audioEngine.pause(this.audioId);
                this.isPause = true;
            } else {
                console.warn("InnerAudioContext pause: currently music was pause");
            }

        } else {
            console.warn("InnerAudioContext pause: currently is no music");
        }

        var cbArray = this.getFunctionCallbackArray("onPause");
        if (cbArray !== undefined) {
            this.onFunctionCallback(cbArray);
        }
    }

    stop() {
        if (this.audioId !== undefined) {
            audioEngine.stop(this.audioId);
            this.audioId = undefined;
        } else {
            console.warn("InnerAudioContext stop: currently is no music");
        }

        var cbArray = this.getFunctionCallbackArray("onStop");
        if (cbArray !== undefined) {
            this.onFunctionCallback(cbArray);
        }
    }

    seek(position) {
        if (this.audioId !== undefined) {
            audioEngine.setCurrentTime(this.audioId, position);
        } else {
            console.warn("InnerAudioContext seek: currently is no music");
        }
    }

    destroy() {
        audioEngine.end();
    }

    onEnded(callback) {
        if (this.audioId !== undefined) {
            audioEngine.setFinishCallback(this.audioId, callback);
        } else {
            console.warn("InnerAudioContext onEnded: currently is no music");
        }
    }

    onPlay(callback) {
        this.pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        this.removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        this.pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        this.removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        this.pushFunctionCallback("onStop", callback);
    }

    offStop(callback) {
        this.removeFunctionCallback("onStop", callback);
    }

    onError(callback) {
        this.pushFunctionCallback("onError", callback);
    }

    offError(callback) {
        this.removeFunctionCallback("onError", callback);
    }

    // callback function tool
    pushFunctionCallback(name, cb) {
        if (typeof name !== "string" || typeof cb !== "function") {
            return;
        }
        var arr = this.cbFunctionArrayMap[name];
        if (!Array.isArray(arr)) {
            arr = [];
            this.cbFunctionArrayMap[name] = arr;
        }
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i] === cb) {
                return;
            }
        }
        arr.push(cb);
    }

    removeFunctionCallback(name, cb) {
        var arr = this.cbFunctionArrayMap[name];
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

    getFunctionCallbackArray(name) {
        var arr = this.cbFunctionArrayMap[name];
        if (arr === undefined) {
            return undefined;
        }
        return arr;
    }

    onFunctionCallback(cbFunctionArray) {
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

}

module.exports = new InnerAudioContext();