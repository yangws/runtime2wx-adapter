//var rt = loadRuntime();
var InnerAudioContext = require("InnerAudioContext");

var res = require("resource");
var uiUtil = require("ui_util");
var ui = require("ui");

module.exports = cc.Class({
    extends: require("ui_base"),

    properties: {
        sv_tests: cc.ScrollView,
        node_volume_template: cc.Node,
        audioClip: {
            type: cc.AudioClip,
            default: null,
        },
    },

    onClickButtonCancel() {
        //rt.AudioEngine.stopAll();
        InnerAudioContext.stop();
        InnerAudioContext.destroy();
        ui.close();
    },

    onLoad() {
        this._super();
        this.node_volume_template.active = false;

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
            InnerAudioContext.volume = this.volume;
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
        InnerAudioContext.loop = this.isLoop;
        //var isLoop = rt.AudioEngine.isLoop(this.audioId);
        var isLoop = InnerAudioContext.loop;
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
        this.audioItem.setEvent("当前音乐音量:" + InnerAudioContext.volume);
    },

    onClickButtonGetCurrentTime() {
        // if (this.audioId !== undefined) {
        //     this.audioItem.setEvent("当前音乐时间:" + rt.AudioEngine.getCurrentTime(this.audioId));
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        this.audioItem.setEvent("当前音乐时间:" + InnerAudioContext.currentTime);
    },

    onClickButtonGetTotalTime() {
        // if (this.audioId !== undefined) {
        //     this.audioItem.setEvent("总时长:" + rt.AudioEngine.getDuration(this.audioId));
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        if (InnerAudioContext.duration !== 0) {
            this.audioItem.setEvent("总时长:" + InnerAudioContext.duration);
        } else {
            this.audioItem.setEvent("当前无音乐");
        }
    },

    onClickButtonPlay() {
        //this.audioId = rt.AudioEngine.play(this.audioClip.nativeUrl, this.isLoop, this.volume);
        InnerAudioContext.src = this.audioClip.nativeUrl;
        InnerAudioContext.loop = true;
        InnerAudioContext.volume = this.volume;
        InnerAudioContext.play();
        this.audioItem.setEvent("开始播放音乐");
    },

    onClickButtonStop() {
        // if (this.audioId !== undefined) {
        //     rt.AudioEngine.stop(this.audioId);
        //     this.audioItem.setEvent("停止播放当前音乐");
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        InnerAudioContext.stop();
        this.audioItem.setEvent("停止播放当前音乐");
    },

    onClickButtonPause() {
        // if (this.audioId !== undefined) {
        //     rt.AudioEngine.pause(this.audioId);
        //     this.audioItem.setEvent("暂停播放当前音乐");
        // } else {
        //     this.audioItem.setEvent("当前无音乐");
        // }
        InnerAudioContext.pause();
        this.audioItem.setEvent("暂停播放当前音乐");
    },

    onClickButtonAutoplay() {
        InnerAudioContext.src = this.audioClip.nativeUrl;
        InnerAudioContext.autoplay = true;
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
            InnerAudioContext.onPlay(this.onPlayCallback);
        } else {
            lbl.string = "监听播放";
            InnerAudioContext.offPlay(this.onPlayCallback);
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
            InnerAudioContext.onStop(this.onStopCallback);
        } else {
            lbl.string = "监听停止";
            InnerAudioContext.offStop(this.onStopCallback);
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
            InnerAudioContext.onPause(this.onPauseCallback);
        } else {
            lbl.string = "监听暂停";
            InnerAudioContext.offPause(this.onPauseCallback);
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
            InnerAudioContext.onEnded(this.onEndedCallback);
        } else {
            lbl.string = "监听音频结束";
            InnerAudioContext.offEnded(this.onEndedCallback);
        }
    },

    onClickButtonIsPause() {
        if (InnerAudioContext.paused) {
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
            var total = InnerAudioContext.duration;
            var current = total * timeSlider.progress;
            InnerAudioContext.seek(current);
            this.audioItem.setEvent("设置音乐时间成功");
        }.bind(this);

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
