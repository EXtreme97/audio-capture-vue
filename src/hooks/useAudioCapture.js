import { ref } from "vue";
const useAudioCapture = () => {
  let mediaRecorder,
    context,
    worker,
    mp3buf = [],
    audioBox;
  const volume = ref(0);
  const start = () => {
    audioBox = document.querySelector(".audio-box");
    navigator.mediaDevices.getUserMedia({ audio: true }).then(async (stream) => {
      //使用MediaRecorder类采集音频
      // mediaRecorder = new MediaRecorder(stream);
      // mediaRecorder.start();
      // mediaRecorder.ondataavailable = (e) => {
      //   chunks.push(e.data);
      // };
      // mediaRecorder.onstop = (e) => {
      //   let blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
      //   // let blob = new Blob(chunks, { type: "audio/mp3" });
      //   chunks = [];
      //   console.log(blob);
      //   let audioURL = window.URL.createObjectURL(blob);
      //   let audioBox = document.querySelector(".audio-box");
      //   let audio = document.createElement("audio");
      //   let dl = document.createElement("a");
      //   dl.innerHTML = "下载";
      //   dl.href = audioURL;
      //   dl.setAttribute("download", true);
      //   audioBox.appendChild(dl);
      //   audio.setAttribute("src", audioURL);
      //   audio.setAttribute("controls", true);
      //   audioBox.appendChild(audio);
      // };
      context = new AudioContext();
      const mediaNode = context.createMediaStreamSource(stream);
      const recorder = (context.createScriptProcessor || context.createJavaScriptNode).bind(context);
      const processor = recorder();
      // 开启一个将pcm转成mp3的线程
      worker = new Worker(new URL("/public/scripts/audio-transcode-worker.js?worker", import.meta.url));
      processor.connect(context.destination);
      processor.onaudioprocess = (e) => {
        const leftChannel = e.inputBuffer.getChannelData(0),
          rightChannel = e.inputBuffer.getChannelData(1);
        worker.postMessage(leftChannel); // 只处理左声道
      };
      mediaNode.connect(processor);
      worker.onmessage = (e) => {
        mp3buf.push(e.data);
      };

      // 用AudioWorkletProcessor接口推送音频,开启一个专门处理音频的线程
      await context.audioWorklet.addModule("/public/scripts/audio-stream-processor.js");
      const audioWorkletNode = new AudioWorkletNode(context, "audio-stream-processor");
      mediaNode.connect(audioWorkletNode);
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.srcObject = stream;
      const audioNode = context.createMediaElementSource(audio);
      audioBox.append(audio);
      audioWorkletNode.port.onmessage = (e) => {
        volume.value = e.data.volume;
      };
      audioWorkletNode.connect(context.destination);
      audioNode.connect(context.destination);

      /**
       * TODO
       * 音频可视化
       */
      //
      // const analyzer = context.createAnalyser();
      // analyzer.fftSize = 512;
      // const bufferLength = analyzer.frequencyBinCount;
      // const dataArray = new Uint8Array(bufferLength);
      // console.log(dataArray);

      // analyzer.connect(context.destination);
      // audioNode.connect(analyzer);
    });
  };
  const terminate = () => {
    mediaRecorder && mediaRecorder.stop();
    context && context.close();
    worker && worker.terminate();
    // const mp3Blob = new Blob([...mp3buf], { type: "audio/mp3" });
    // const mp3URL = URL.createObjectURL(mp3Blob);
    // let audioBox = document.querySelector(".audio-box");
    // let audio = document.createElement("audio");
    // audio.src = mp3URL;
    // audio.controls = true;
    // audioBox.append(audio);
  };
  const suspend = () => {
    mediaRecorder && mediaRecorder.pause();
    context && context.suspend();
  };
  const remuse = () => {
    mediaRecorder && mediaRecorder.remuse();
    context && context.remuse();
  };
  return {
    start,
    terminate,
    suspend,
    remuse,
    volume,
  };
};
export default useAudioCapture;
