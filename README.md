# Cocos Runtime JavaScript API for WX

Cocos Runtime 为基于 JavaScript 虚拟机的脚本运行环境，为了方便适配微信平台的游戏在 Runtime 上运行，在此基于 Runtime JavaScript API 实现了一些游戏常用的微信标准的 JavaScript API，这类 API 在 Runtime 上的使用方式和微信环境中保持一致。

##  媒体

### 音频
```JS
    InnerAudioContext createInnerAudioContext()
```
**支持版本: (core 版本 >= 1.1.0)**
创建内部 `audio` 上下文 `InnerAudioContext` 对象。

*返回值*

- InnerAudioContext

```JS
    InnerAudioContext
```
**支持版本: (core 版本 >= 1.1.0)**
`InnerAudioContext` 实例，可通过 `createInnerAudioContext` 接口获取实例。

*属性*

- string src
音频资源的地址，用于直接播放。

- number startTime
开始播放的位置（单位：s），默认为 0

- boolean autoplay
是否自动开始播放，默认为 false

- boolean loop
是否循环播放，默认为 false

- boolean obeyMuteSwitch
(空实现,只为保持接口完整性)

- number volume
音量。范围 0~1。默认为 1

- number duration
当前音频的长度（单位 s）。只有在当前有合法的 src 时返回（只读）

- number currentTime
当前音频的播放位置（单位 s）。只有在当前有合法的 src 时返回，时间保留小数点后 6 位（只读）

- boolean paused
当前是是否暂停或停止状态（只读）

- number buffered
音频缓冲的时间点，仅保证当前播放时间点到此时间点内容已缓冲（只读）

*方法*

- InnerAudioContext.play()
播放

- InnerAudioContext.pause()
暂停。暂停后的音频再播放会从暂停处开始播放

- InnerAudioContext.stop()
停止。停止后的音频再播放会从头开始播放。

- InnerAudioContext.seek(number position)
跳转到指定位置

- InnerAudioContext.destroy()
销毁当前实例

- InnerAudioContext.onCanplay(function callback)
监听音频进入可以播放状态的事件。但不保证后面可以流畅播放

- InnerAudioContext.offCanplay(function callback)
取消监听音频进入可以播放状态的事件。但不保证后面可以流畅播放

- InnerAudioContext.onPlay(function callback)
监听音频播放事件

- InnerAudioContext.offPlay(function callback)
取消监听音频播放事件

- InnerAudioContext.onPause(function callback)
监听音频暂停事件

- InnerAudioContext.offPause(function callback)
取消监听音频暂停事件

- InnerAudioContext.onStop(function callback)
监听音频停止事件

- InnerAudioContext.offStop(function callback)
取消监听音频停止事件

- InnerAudioContext.onEnded(function callback)
监听音频自然播放至结束的事件

- InnerAudioContext.offEnded(function callback)
取消监听音频自然播放至结束的事件

- InnerAudioContext.onTimeUpdate(function callback)
监听音频播放进度更新事件

- InnerAudioContext.offTimeUpdate(function callback)
取消监听音频播放进度更新事件

- InnerAudioContext.onError(function callback)
监听音频播放错误事件

- InnerAudioContext.offError(function callback)
取消监听音频播放错误事件

- InnerAudioContext.onWaiting(function callback)
监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发

- InnerAudioContext.offWaiting(function callback)
取消监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发

- InnerAudioContext.onSeeking(function callback)
监听音频进行跳转操作的事件

- InnerAudioContext.offSeeking(function callback)
取消监听音频进行跳转操作的事件

- InnerAudioContext.onSeeked(function callback)
监听音频完成跳转操作的事件

- InnerAudioContext.offSeeked(function callback)
取消监听音频完成跳转操作的事件

```JS
    InnerAudioContext.play()
```
播放

```JS
    InnerAudioContext.pause()
```
暂停。暂停后的音频再播放会从暂停处开始播放

```JS
    InnerAudioContext.stop()
```
停止。停止后的音频再播放会从头开始播放。

```JS
    InnerAudioContext.seek(number position)
```
跳转到指定位置

*参数*

- number position
跳转的时间，单位 s。精确到小数点后 3 位，即支持 ms 级别精确度

```JS
    InnerAudioContext.destroy()
```
销毁当前实例

```JS
    InnerAudioContext.onCanplay(function callback)
```
监听音频进入可以播放状态的事件。但不保证后面可以流畅播放

*参数*

- function callback
  音频进入可以播放状态的事件的回调函数

```JS
    InnerAudioContext.offCanplay(function callback)
```
取消监听音频进入可以播放状态的事件。但不保证后面可以流畅播放

*参数*

- function callback
音频进入可以播放状态的事件的回调函数

```JS
    InnerAudioContext.onPlay(function callback)
```
监听音频播放事件

*参数*

- function callback
音频播放事件的回调函数

```JS
    InnerAudioContext.offPlay(function callback)
```
取消监听音频播放事件

*参数*

- function callback
音频播放事件的回调函数

```JS
    InnerAudioContext.onPause(function callback)
```
监听音频暂停事件

*参数*

- function callback
音频暂停事件的回调函数

```JS
    InnerAudioContext.offPause(function callback)
```
取消监听音频暂停事件

参数
function callback
音频暂停事件的回调函数

```JS
    InnerAudioContext.onStop(function callback)
```
监听音频停止事件

*参数*

- function callback
音频停止事件的回调函数

```JS
    InnerAudioContext.offStop(function callback)
```
取消监听音频停止事件

*参数*

- function callback
音频停止事件的回调函数

```JS
    InnerAudioContext.onEnded(function callback)
```
监听音频自然播放至结束的事件

*参数*

- function callback
音频自然播放至结束的事件的回调函数

```JS
    InnerAudioContext.offEnded(function callback)
```
取消监听音频自然播放至结束的事件

*参数*

- function callback
音频自然播放至结束的事件的回调函数

```JS
    InnerAudioContext.onTimeUpdate(function callback)
```
监听音频播放进度更新事件

*参数*

- function callback
音频播放进度更新事件的回调函数

```JS
    InnerAudioContext.offTimeUpdate(function callback)
```
取消监听音频播放进度更新事件

*参数*

- function callback
音频播放进度更新事件的回调函数

```JS
    InnerAudioContext.onError(function callback)
```
监听音频播放错误事件

*参数*

- function callback
音频播放错误事件的回调函数

```JS
    InnerAudioContext.offError(function callback)
```
取消监听音频播放错误事件

*参数*

- function callback
音频播放错误事件的回调函数

```JS
    InnerAudioContext.onWaiting(function callback)
```
监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发

*参数*

- function callback
音频加载中事件的回调函数

```JS
    InnerAudioContext.offWaiting(function callback)
```
取消监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
*参数*

- function callback
音频加载中事件的回调函数

```JS
    InnerAudioContext.onSeeking(function callback)
```
监听音频进行跳转操作的事件

*参数*

- function callback
音频进行跳转操作的事件的回调函数

```JS
    InnerAudioContext.offSeeking(function callback)
```
取消监听音频进行跳转操作的事件

*参数*

- function callback
音频进行跳转操作的事件的回调函数

```JS
    InnerAudioContext.onSeeked(function callback)
```
监听音频完成跳转操作的事件

*参数*

- function callback
音频完成跳转操作的事件的回调函数

```JS
    InnerAudioContext.offSeeked(function callback)
```
取消监听音频完成跳转操作的事件

*参数*

- function callback
音频完成跳转操作的事件的回调函数

## 编译说明
- 进入到 runtime2wx-adapter 目录下，先执行 npm install，然后再执行 gulp，会生成 rt-wx-adapter.js 放置在 runtime2wx-adapter/test/assets/Adapter 目录下
- nodejs 版本：v8.9.4
- gulp 版本：v3.9.1






