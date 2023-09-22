self.importScripts("./lame.min.js");

const maxSamples = 1152;
const Lamejs = new lamejs();
const mp3Encoder = new Lamejs.Mp3Encoder(1, 44100, 128); //直接采用默认值
const dataBuffer = [];
/**
 * 转16位
 * @param {*} input
 * @param {*} output
 */
const floatTo16BitPCM = (input, output) => {
  for (var i = 0; i < input.length; i++) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
};
/**
 * 获取16位的数据
 * @param {*} arrayBuffer
 * @returns
 */
const convertBuffer = (arrayBuffer) => {
  var data = new Float32Array(arrayBuffer);
  var out = new Int16Array(arrayBuffer.length);
  floatTo16BitPCM(data, out);
  return out;
};
/**
 * 合并到缓冲区
 */
const appendToBuffer = (mp3Buf) => {
  dataBuffer.push(new Int8Array(mp3Buf));
};

self.onmessage = (e) => {
  const { data } = e;
  let samplesMono = convertBuffer(data);
  var remaining = samplesMono.length;
  for (var i = 0; remaining >= 0; i += maxSamples) {
    var left = samplesMono.subarray(i, i + maxSamples);
    var mp3buf = mp3Encoder.encodeBuffer(left);
    // console.log(mp3buf);
    //把已转码数据传回主线程
    postMessage(mp3buf);
    //推流
    appendToBuffer(mp3buf);
    remaining -= maxSamples;
  }
};
