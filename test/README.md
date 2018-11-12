# Cocos Runtime JavaScript API for WX

Cocos Runtime 为基于 JavaScript 虚拟机的脚本运行环境，为了方便适配微信平台的游戏在 Runtime 上运行，Runtime 提供了一些游戏常用的微信标准的 JavaScript API，这类 API 在 Runtime 上的使用方式和微信环境中保持一致。主要有：

- wx.createInnerAudioContext()

##  InnerAudioContext APIs

Runtime本身也有一套AudioEngine音频接口，但接口名称以及逻辑和微信的InnerAudioContext音频接口有些差异，因此通过Adapter的方式模拟实现了有限的InnerAudioContext API 已方便微信游戏适配，具体实现详见[runtime2wx-adapter](https://github.com/yangws/runtime2wx-adapter/tree/master/adapter)。

```
    InnerAudioContext
```
InnerAudioContext 实例，可通过 wx.createInnerAudioContext 接口获取实例。

### 属性
```
    string src
```
音频资源的地址，用于直接播放。

```
    boolean autoplay
```
是否自动开始播放。

```
    boolean loop
```
是否循环播放。

```
    number volume
```
音量。范围 0~1。

```
    number duration
```
当前音频的长度（单位 s）（只读）。

```
    number currentTime
```
当前音频的播放位置（单位 s）（只读）。

```
    boolean paused
```
当前是否暂停或停止状态（只读）。

### 方法
```
   InnerAudioContext.play()
```
播放。

```
   InnerAudioContext.pause()
```
暂停。暂停后的音频再播放会从暂停处开始播放。

```
   InnerAudioContext.stop()
```
停止。停止后的音频再播放会从头开始播放。

```
   InnerAudioContext.seek(number position)
```
跳转到指定位置。

*参数*

- position

指定需要跳转到的位置。

```
   InnerAudioContext.destroy()
```
销毁当前实例。

```
   InnerAudioContext.onPlay(function callback)
```
监听音频播放事件。

*参数*

- callback

音频播放事件的回调函数。

```
   InnerAudioContext.offPlay(function callback)
```
取消监听音频播放事件。

*参数*

- callback

音频播放事件的回调函数。

```
   InnerAudioContext.onPause(function callback)
```
监听音频暂停事件。

*参数*

- callback

音频暂停事件的回调函数。

```
   InnerAudioContext.offPause(function callback)
```
取消监听音频暂停事件。

*参数*

- callback

音频暂停事件的回调函数。

```
   InnerAudioContext.onStop(function callback)
```
监听音频停止事件。

*参数*

- callback

音频停止事件的回调函数。

```
   InnerAudioContext.offStop(function callback)
```
取消监听音频停止事件。

*参数*

- callback

音频停止事件的回调函数。

```
   InnerAudioContext.onEnded(function callback)
```
监听音频自然播放至结束的事件。

*参数*

- callback

音频自然播放至结束的事件的回调函数。

```
   InnerAudioContext.offEnded(function callback)
```
取消监听音频自然播放至结束的事件。

*参数*

- callback

音频自然播放至结束的事件的回调函数。

### 以下为适配InnerAudioContext不支持的接口
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
- 进入到runtime2wx-adapter目录下，执行gulp，会生成rt-wx-adapter.js放置在runtime2wx-adapter/test/assets/Adapter目录下
- nodejs版本：v8.9.4






