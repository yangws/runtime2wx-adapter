var res = require("resource");
var uiUtil = require("ui_util");
var ui = require("ui");
var innerAudioContext = loadRuntime().createInnerAudioContext();
// var innerAudioContext2 = loadRuntime().createInnerAudioContext();

// var createInnerAudioContext = require("InnerAudioContext");
// var innerAudioContext = new createInnerAudioContext();


module.exports = cc.Class({
    extends: require("ui_base"),

    properties: {
        sv_tests: cc.ScrollView,
        node_volume_template: cc.Node,
        audioClip: {
            type: cc.AudioClip,
            default: null,
        },

        audioClip2: {
            type: cc.AudioClip,
            default: null,
        },
    },

    onClickButtonCancel() {
        //rt.AudioEngine.stopAll();
        innerAudioContext.stop();
        innerAudioContext.destroy();
        ui.close();
    },

    onLoad() {
        this._super();
        this.node_volume_template.active = false;

        this.listenTimeUpdate = false;
        this._testAudio();
    },

    _getTimeStr() {
        var myDate = new Date();
        var time = new Date().Format("yyyy-MM-dd HH:mm:ss");
        return time;
    },

    _testAudio() {
        var message = "音频测试例";
        var item = this._createVolumeItem("音频:", message, function (volume) {
            this.volume = volume;
            // if (this.audioId !== undefined) {
            //     rt.AudioEngine.setVolume(this.audioId, this.volume);
            // }
            if (innerAudioContext.paused === false) {
                innerAudioContext.volume = this.volume;
                this.audioItem.setEvent("设置音乐音量为:" + this.volume);
            } else {
                this.audioItem.setEvent("当前没有音乐播放");
            }

        }.bind(this));
        this.volume = 0.5;
        this.audioItem = item;
        this.isLoop = false;
    },

    onSliderValueChange(event, customEventData) {
        event.handle.onClick();
    },

    onSliderTimeValueChange(event, customEventData) {
        event.handle.onClick();
    },

    onClickButtonLoop(event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);

        //rt.AudioEngine.setLoop(this.audioId, this.isLoop);
        innerAudioContext.loop = this.isLoop;
        //var isLoop = rt.AudioEngine.isLoop(this.audioId);
        var isLoop = innerAudioContext.loop;
        if (isLoop) {
            this.audioItem.setEvent("当前音乐循环播放");
        } else {
            this.audioItem.setEvent("当前音乐单次播放");
        }

        this.isLoop = !this.isLoop;
        lbl.string = this.isLoop ? "循环播放" : "单曲播放";
    },

    onClickButtonGetVolume() {
        // if (this.audioId !== undefined) {
        //     this.audioItem.setEvent("当前音乐音量:" + rt.AudioEngine.getVolume(this.audioId));
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        this.audioItem.setEvent("当前音乐音量:" + innerAudioContext.volume);
    },

    onClickButtonGetCurrentTime() {
        // if (this.audioId !== undefined) {
        //     this.audioItem.setEvent("当前音乐时间:" + rt.AudioEngine.getCurrentTime(this.audioId));
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        this.audioItem.setEvent("当前音乐时间:" + innerAudioContext.currentTime);
    },

    onClickButtonGetTotalTime() {
        // if (this.audioId !== undefined) {
        //     this.audioItem.setEvent("总时长:" + rt.AudioEngine.getDuration(this.audioId));
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        if (innerAudioContext.duration !== 0) {
            this.audioItem.setEvent("总时长:" + innerAudioContext.duration);
        } else {
            this.audioItem.setEvent("当前无音乐");
        }
    },

    onClickButtonPlay() {
        innerAudioContext.src = "http://47.98.62.68/cocos-runtime-demo/media/StreamAudio.mp3";
        innerAudioContext.loop = true;
        innerAudioContext.volume = this.volume;
        innerAudioContext.startTime = 0;
        innerAudioContext.play();
        this.audioItem.setEvent("开始播放音乐");
    },

    onClickButtonPlay10() {
        innerAudioContext.src = "http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46";
        innerAudioContext.loop = true;
        innerAudioContext.volume = this.volume;
        innerAudioContext.startTime = 10;
        innerAudioContext.play();
        this.audioItem.setEvent("从10秒开始播放音乐。");
    },

    onClickButtonPlayError() {
        innerAudioContext.src = "http://47.98.62.68/cocos-runtime-demo/media/NoExistFile.mp3";
        innerAudioContext.loop = true;
        innerAudioContext.volume = this.volume;
        innerAudioContext.startTime = 0;
        innerAudioContext.play();
        this.audioItem.setEvent("请监听错误");
    },

    onClickButtonStop() {
        // if (this.audioId !== undefined) {
        //     rt.AudioEngine.stop(this.audioId);
        //     this.audioItem.setEvent("停止播放当前音乐");
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        innerAudioContext.stop();
        this.audioItem.setEvent("停止播放当前音乐");
    },

    onClickButtonPause() {
        // if (this.audioId !== undefined) {
        //     rt.AudioEngine.pause(this.audioId);
        //     this.audioItem.setEvent("暂停播放当前音乐");
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        innerAudioContext.pause();
        this.audioItem.setEvent("暂停播放当前音乐");
    },

    onClickButtonAutoplay() {
        innerAudioContext.src = this.audioClip.nativeUrl;
        innerAudioContext.autoplay = true;
        this.audioItem.setEvent("自动播放音乐");
    },

    onClickButtonPlayCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);

        this.isPlayCb = !this.isPlayCb;

        if (this.onPlayCallback === undefined) {
            this.onPlayCallback = function () {
                this.audioItem.setMonitorEvent("监听播放成功");
            }.bind(this);
        }

        if (this.isPlayCb) {
            lbl.string = "取消监听播放";
            innerAudioContext.onPlay(this.onPlayCallback);
        } else {
            lbl.string = "监听播放";
            innerAudioContext.offPlay(this.onPlayCallback);
        }
    },

    onClickButtonErrorCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);

        this.isErrorCb = !this.isErrorCb;

        if (this.onErrorCallback === undefined) {
            this.onErrorCallback = function (res) {
                this.audioItem.setMonitorEvent("errMsg: " + res.errMsg + ", errCode: " + res.errCode);
                innerAudioContext.stop();
            }.bind(this);
        }

        if (this.isErrorCb) {
            lbl.string = "取消监听播放错误";
            innerAudioContext.onError(this.onErrorCallback);
        } else {
            lbl.string = "监听播放错误";
            innerAudioContext.offError(this.onErrorCallback);
        }
    },

    onClickButtonCanPlayCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);

        this.isCanPlayCb = !this.isCanPlayCb;

        if (this.onCanPlayCallback === undefined) {
            this.onCanPlayCallback = function () {
                this.audioItem.setMonitorEvent("监听可以播放成功");
            }.bind(this);
        }

        if (this.isCanPlayCb) {
            lbl.string = "取消监听可以播放";
            innerAudioContext.onCanplay(this.onCanPlayCallback);
        } else {
            lbl.string = "监听可以播放";
            innerAudioContext.offCanplay(this.onCanPlayCallback);
        }
    },

    onClickButtonWaitingCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);

        this.isWaitingCb = !this.isWaitingCb;

        if (this.onWaitingCallback === undefined) {
            this.onWaitingCallback = function () {
                this.audioItem.setMonitorEvent("监听音频加载中");
            }.bind(this);
        }

        if (this.isWaitingCb) {
            lbl.string = "取消监听加载中";
            innerAudioContext.onWaiting(this.onWaitingCallback);
        } else {
            lbl.string = "监听加载中";
            innerAudioContext.offWaiting(this.onWaitingCallback);
        }
    },

    onClickButtonStopCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);
        this.isStopCb = !this.isStopCb;

        if (this.onStopCallback === undefined) {
            this.onStopCallback = function () {
                this.audioItem.setMonitorEvent("监听停止成功");
            }.bind(this);
        }

        if (this.isStopCb) {
            lbl.string = "取消监听停止";
            innerAudioContext.onStop(this.onStopCallback);
        } else {
            lbl.string = "监听停止";
            innerAudioContext.offStop(this.onStopCallback);
        }
    },

    onClickButtonPauseCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);
        this.isPauseCb = !this.isPauseCb;

        if (this.onPauseCallback === undefined) {
            this.onPauseCallback = function () {
                this.audioItem.setMonitorEvent("监听暂停成功");
            }.bind(this);
        }

        if (this.isPauseCb) {
            lbl.string = "取消监听暂停";
            innerAudioContext.onPause(this.onPauseCallback);
        } else {
            lbl.string = "监听暂停";
            innerAudioContext.offPause(this.onPauseCallback);
        }
    },

    onClickButtonEndedCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);
        this.isEndedCb = !this.isEndedCb;

        if (this.onEndedCallback === undefined) {
            this.onEndedCallback = function () {
                this.audioItem.setMonitorEvent("监听音频播放结束成功");
            }.bind(this);
        }

        if (this.isEndedCb) {
            lbl.string = "取消监听结束";
            innerAudioContext.onEnded(this.onEndedCallback);
        } else {
            lbl.string = "监听音频结束";
            innerAudioContext.offEnded(this.onEndedCallback);
        }
    },

    onClickButtonSeekingCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);
        this.isSeekingCb = !this.isSeekingCb;

        if (this.onSeekingCallback === undefined) {
            this.onSeekingCallback = function () {
                this.audioItem.setMonitorEvent("监听音频进行跳转成功");
            }.bind(this);
        }

        if (this.isSeekingCb) {
            lbl.string = "取消监听进行跳转";
            innerAudioContext.onSeeking(this.onSeekingCallback);
        } else {
            lbl.string = "监听进行跳转";
            innerAudioContext.offSeeking(this.onSeekingCallback);
        }
    },

    onClickButtonSeekedCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);
        this.isSeekedCb = !this.isSeekedCb;

        if (this.onSeekedCallback === undefined) {
            this.onSeekedCallback = function () {
                this.audioItem.setMonitorEvent("监听音频完成跳转成功");
            }.bind(this);
        }

        if (this.isSeekedCb) {
            lbl.string = "取消监听完成跳转";
            innerAudioContext.onSeeked(this.onSeekedCallback);
        } else {
            lbl.string = "监听完成跳转";
            innerAudioContext.offSeeked(this.onSeekedCallback);
        }
    },

    onClickButtonBufferedCb(event) {
        var buffered = innerAudioContext.buffered;
        this.audioItem.setEvent("以缓冲时间：" + buffered);
    },

    onClickButtonTimeUpdateCb(event) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var lbl = button.node.getChildByName("Label").getComponent(cc.Label);

        this.listenTimeUpdate = !this.listenTimeUpdate;
        if (this.timeUpdateCb === undefined) {
            this.timeUpdateCb = function () {
                var currentTime = innerAudioContext.currentTime;
                var duration = innerAudioContext.duration;
                this.timeSlider.progress = currentTime / duration;
                this.audioItem.setEvent("当前进度为：" + Math.floor(currentTime / duration * 100) / 100);
            }.bind(this);
        }
        if (this.listenTimeUpdate === true) {
            // 监听
            innerAudioContext.onTimeUpdate(this.timeUpdateCb);
            lbl.string = "取消监听进度";
        } else {
            // 取消监听
            innerAudioContext.offTimeUpdate(this.timeUpdateCb);
            lbl.string = "监听进度";
        }
    },

    onClickButtonIsPause() {
        if (innerAudioContext.paused) {
            this.audioItem.setEvent("当前是暂停或停止状态");
        } else {
            this.audioItem.setEvent("当前不是暂停或停止状态");
        }
    },

    onClickButtonLeft(event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        button.onClick();
    },

    onClickButtonRight(event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        button.onClick();
    },

    _createVolumeItem(title, message, bindFun) {
        var item = cc.instantiate(this.node_volume_template);

        uiUtil.setChildLabel(item, "lb_title", title, res.color.white);
        //提示信息
        uiUtil.setChildLabel(item, "lb_message", message, res.color.orange);

        var volumeSlider = uiUtil.getChild(item, "slider", cc.Slider);
        volumeSlider.handle.onClick = function () {
            bindFun(volumeSlider.progress);
        }

        var timeSlider = uiUtil.getChild(item, "slider_time", cc.Slider);
        timeSlider.handle.onClick = function () {
            // if (this.audioId !== undefined) {
            //     var total = rt.AudioEngine.getDuration(this.audioId);
            //     var current = total * timeSlider.progress;
            //     rt.AudioEngine.setCurrentTime(this.audioId, current);
            //     this.audioItem.setEvent("设置音乐时间成功");
            // } else {
            //     this.audioItem.setEvent("当前无音乐");
            // }
            if (innerAudioContext.paused === false) {
                var total = innerAudioContext.duration;
                var current = total * timeSlider.progress;
                innerAudioContext.seek(current);
                this.audioItem.setEvent("设置音乐时间为：" + current);
            } else {
                this.audioItem.setEvent("当前没有音乐播放");
            }

        }.bind(this);
        this.timeSlider = timeSlider;

        item.setEvent = function (event) {
            var color = res.color.green;
            if (arguments.length == 2) {
                color = arguments[1];
            }
            uiUtil.setChildLabel(item, "lb_message", event, color);
        };


        uiUtil.setChildLabel(item, "lb_monitor_title", "监听:", res.color.white);
        //提示信息
        uiUtil.setChildLabel(item, "lb_monotor_message", "监听状态", res.color.orange);
        item.setMonitorEvent = function (event) {
            var color = res.color.green;
            if (arguments.length == 2) {
                color = arguments[1];
            }
            uiUtil.setChildLabel(item, "lb_monotor_message", event, color);
        };


        item.parent = this.sv_tests.content;
        item.active = true;
        return item;
    },
});

