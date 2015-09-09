# TalkingPlatform
## 这是啥？
基于IONIC framework的HTML5双平台APP
## 代码包含什么
代码包含移动端代码，可再IOS、Android双平台编译运行

核心代码在app文件夹中
## how to run
先要部署IOS、Android运行环境（模拟机or真机）

安装cordova

```
npm install cordova -g

安装cordova pulgins

``` 
cordova plugin add org.apache.cordova.camera
```
cordova plugin add org.apache.cordova.console
```
cordova plugin add org.apache.cordova.file
```
cordova plugin add org.apache.cordova.file-transfer
```
cordova plugin add org.apache.cordova.media
```
cordova plugin add cordova.phonegap.audio.encode
```
cordova plugin add com.knowledgecode.cordova.websocket
```
cordova plugin add com.luhuiguo.cordova.voice

安装依赖包

```
npm install 
```
bower install

跑跑跑 

``` 
cordova run ios
```
cordova run android
