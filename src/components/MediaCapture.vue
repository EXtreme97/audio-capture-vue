<script setup>
import { ref } from "vue";
import useAudioCapture from "../hooks/useAudioCapture";
const { start, terminate, suspend, remuse, volume } = useAudioCapture();
</script>
<template>
  <div class="media-capture">
    <div class="operate">
      <el-button type="primary" @click="start">开始</el-button>
      <el-button type="danger" @click="terminate">终止</el-button>
      <el-button type="warning" @click="suspend">暂停</el-button>
    </div>
    <div class="audio-box">
      <p style="color: #333">{{ volume.toFixed(5) }}</p>
    </div>
  </div>
</template>
<style>
.media-capture {
  width: 100vw;
  height: 100vh;
  background-color: #eee;
  padding: 30px;
  text-align: center;
  box-sizing: border-box;
  .operate {
    margin-bottom: 300px;
  }
}
</style>
