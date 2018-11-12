# Cocos Runtime JavaScript API for WX

Cocos Runtime 为基于 JavaScript 虚拟机的脚本运行环境，为了方便适配微信平台的游戏在 Runtime 上运行，这里提供了一些游戏常用的微信标准的 JavaScript API，这类 API 在 Runtime 上的使用方式和微信环境中保持一致。主要有：

- wx.createInnerAudioContext()

##  InnerAudioContext APIs

Runtime 本身也有一套 AudioEngine 音频接口，但接口名称以及逻辑和微信的 InnerAudioContext 音频接口有些差异，因此通过 Adapter 的方式模拟实现了 InnerAudioContext API 已方便微信游戏适配，具体实现详见 [runtime2wx-adapter](https://github.com/yangws/runtime2wx-adapter/tree/master/adapter)，微信官方API请查看 [InnerAudioContext API 参考文档](https://developers.weixin.qq.com/minigame/dev/api/media/audio/InnerAudioContext.html)。


### 不支持的API
- number startTime
- boolean obeyMuteSwitch
- number buffered
- InnerAudioContext.onCanplay(function callback)
- InnerAudioContext.offCanplay(function callback)
- InnerAudioContext.onTimeUpdate(function callback)
- InnerAudioContext.offTimeUpdate(function callback)
- InnerAudioContext.onError(function callback)
- InnerAudioContext.offError(function callback)
- InnerAudioContext.onWaiting(function callback)
- InnerAudioContext.offWaiting(function callback)
- InnerAudioContext.onSeeking(function callback)
- InnerAudioContext.onSeeking(function callback)
- InnerAudioContext.onSeeked(function callback)
- InnerAudioContext.offSeeked(function callback)

### 编译说明
- 进入到 runtime2wx-adapter 目录下，执行 gulp，会生成 rt-wx-adapter.js 放置在 runtime2wx-adapter/test/assets/Adapter 目录下
- nodejs 版本：v8.9.4






