var audioEngine;
var rt = loadRuntime();

class InnerAudioContext {

    constructor() {
        audioEngine = rt.AudioEngine;

        this.src = null;
        this.filePath = null;
        this.cbFunctionArrayMap = {};
        this.endCb = null;
        this.inLoop = false;
        this.inVolume = 1.0;
        this.inAutoplay = false;
        this.isStop = false;
        this.isWaiting = false;
        this.isSeeking = false;
        this.isSeeked = false;
        this.audioId = undefined;
        this.PLAYING = 1;
        this.PAUSE = 2;
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
        return ret;
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

    // function
    play() {
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
                    success(msg) {
                        self.filePath = msg["tempFilePath"];
                        self.playing();
                    },
                    fail() {
                        console.error("InnerAudioContext play: downloadFile fail");
                        var cbArray = self.getFunctionCallbackArray("onError");
                        if (cbArray !== undefined) {
                            var res = { errMsg: "downloadFile fail", errCode: 10002 };
                            self.onFunctionCallback(cbArray, res);
                        }
                        return;
                    },
                    complete() {
                        self.isWaiting = false;
                    },
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
                path: this.filePath,
                success: fileExist,
                fail: fileNotExist
            });

        } else {
            this.filePath = this.src;
            this.playing();
        }
    }

    playing() {
        if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PAUSE) {
            if (this.audioId !== undefined) {
                audioEngine.resume(this.audioId);
            } else {
                console.warn("InnerAudioContext resume: currently is no music");
            }
        } else {
            if (this.audioId === undefined) {
                var cbArray = this.getFunctionCallbackArray("onCanplay");
                if (cbArray !== undefined) {
                    this.onFunctionCallback(cbArray);
                }

                this.audioId = audioEngine.play(this.filePath, this.inLoop, this.inVolume);
                this.isStop = false;

                var cbArray2 = this.getFunctionCallbackArray("onPlay");
                if (cbArray2 !== undefined) {
                    this.onFunctionCallback(cbArray2);
                }

            } else if (this.audioId !== undefined && this.loop === false && audioEngine.getState(this.audioId) !== this.PLAYING) {
                this.audioId = undefined;
                this.audioId = audioEngine.play(this.filePath, this.loop, this.inVolume);
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

        var cbArray = this.getFunctionCallbackArray("onPause");
        if (cbArray !== undefined) {
            this.onFunctionCallback(cbArray);
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

        var cbArray = this.getFunctionCallbackArray("onStop");
        if (cbArray !== undefined) {
            this.onFunctionCallback(cbArray);
        }
    }

    seek(position) {
        if (this.audioId !== undefined) {
            this.isSeeking = true;
            this.isSeeked = true;

            var cbArray = this.getFunctionCallbackArray("onSeeking");
            if (cbArray !== undefined) {
                this.onFunctionCallback(cbArray);
            }

            audioEngine.setCurrentTime(this.audioId, position);

            var cbArray2 = this.getFunctionCallbackArray("onSeeked");
            if (cbArray2 !== undefined) {
                this.onFunctionCallback(cbArray2);
            }

        } else {
            console.warn("InnerAudioContext seek: currently is no music");
        }
    }

    destroy() {
        audioEngine.end();
        this.cbFunctionArrayMap = {};
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
        this.pushFunctionCallback("onPlay", callback);
    }

    offPlay(callback) {
        this.removeFunctionCallback("onPlay", callback);
    }

    onPause(callback) {
        if (this.audioId !== undefined && audioEngine.getState(this.audioId) === this.PAUSE) {
            callback();
            return;
        }
        this.pushFunctionCallback("onPause", callback);
    }

    offPause(callback) {
        this.removeFunctionCallback("onPause", callback);
    }

    onStop(callback) {
        if (this.isStop) {
            callback();
            return;
        }
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

    onCanplay(callback) {
        if (this.audioId !== undefined) {
            callback();
            return;
        }
        this.pushFunctionCallback("onCanplay", callback);
    }

    offCanplay(callback) {
        this.removeFunctionCallback("onCanplay", callback);
    }

    onWaiting(callback) {
        if (this.audioId === undefined && this.isWaiting) {
            callback();
            return;
        }
        this.pushFunctionCallback("onWaiting", callback);
    }

    offWaiting(callback) {
        this.removeFunctionCallback("onWaiting", callback);
    }

    onSeeking(callback) {
        if (this.audioId !== undefined && this.isSeeking) {
            this.isSeeking = false;
            callback();
            return;
        }
        this.pushFunctionCallback("onSeeking", callback);
    }

    offSeeking(callback) {
        this.removeFunctionCallback("onSeeking", callback);
    }

    onSeeked(callback) {
        if (this.audioId !== undefined && this.isSeeked) {
            this.isSeeked = false;
            callback();
            return;
        }
        this.pushFunctionCallback("onSeeked", callback);
    }

    offSeeked(callback) {
        this.removeFunctionCallback("onSeeked", callback);
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

module.exports = InnerAudioContext;