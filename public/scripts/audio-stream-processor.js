// importScripts("./lame.min");
class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }
  process(inputs, outputs, parameters) {
    // this.port.postMessage(inputs[0][1]);
    const sample = inputs[0][0];
    let sum = 0,
      rms = 0;
    for (let i = 0; i < sample.length; i += 1) {
      sum += Math.abs(sample[i]);
    }
    rms = sum / sample.length;//音量
    this.port.postMessage({ volume: rms });
    return true;
  }
}
registerProcessor("audio-stream-processor", AudioStreamProcessor);
