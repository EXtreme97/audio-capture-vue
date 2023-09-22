# 浏览器音频采集和转码

使用Web Audio api（MediaRecorder,AudioContext,AudioWorkletProcessor）实现了浏览器音频采集和音量分析，可通过lamejs将音频转码成mp3，已封装成vue3 hooks。

TODO：音频可视化

参考：

* MediaRecorder：https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder
* AudioContext：https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
* AudioWorkletProcessor：https://developer.mozilla.org/zh-CN/docs/Web/API/AudioWorkletProcessor
* Worker：https://developer.mozilla.org/zh-CN/docs/Web/API/Worker
* AudioWorkletNode：https://developer.mozilla.org/zh-CN/docs/Web/API/AudioWorkletNode
* [使用 AudioWorklet 获取麦克风音量（volume-meter） - 掘金 (juejin.cn)](https://juejin.cn/post/6992465931083464735)
* [Web Audio在音频可视化中的应用 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903953130323976?searchId=202309191347029F86731B6AE47B916D52)

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
