/**
 * 要封装WebRTC API，首先需要了解WebRTC的基本概念和工作原理。
 * WebRTC（Web实时通信）是一种实时通信技术，用于在浏览器之间直接进行音视频通信和数据传输。它提供了一组API，用于创建和管理实时通信会话。
 *
 * 以下是封装WebRTC API的一般步骤：
 *
 * 1. 创建一个RTCPeerConnection对象：使用RTCPeerConnection API创建一个本地PeerConnection对象，该对象用于建立和管理与远程对等方之间的连接。
 *
 * 2. 添加本地媒体流：使用getUserMedia API获取本地媒体流（音频和/或视频），然后通过addStream方法将其添加到本地PeerConnection对象中。
 *
 * 3. 设置ICE服务器：通过使用RTCIceServer对象设置ICE服务器，以便在对等方之间进行网络连接。
 *
 * 4. 创建SDP（会话描述协议）：使用createOffer或createAnswer方法创建本地SDP，该SDP包含有关本地媒体流和网络连接的信息。
 *
 * 5. 设置本地SDP：通过setLocalDescription方法将本地SDP设置为本地PeerConnection对象的本地描述。
 *
 * 6. 交换SDP：通过信令通道将本地SDP发送给远程对等方，并接收并设置远程SDP。
 *
 * 7. 设置远程SDP：通过setRemoteDescription方法将远程SDP设置为本地PeerConnection对象的远程描述。
 *
 * 8. 建立ICE候选者：通过监听onicecandidate事件获取ICE候选者，并通过信令通道将其发送给远程对等方。
 *
 * 9. 添加远程媒体流：通过监听onaddstream事件获取远程媒体流，并将其添加到本地界面中进行显示。
 *
 * 10. 建立数据通道（可选）：使用createDataChannel方法创建一个数据通道，用于在对等方之间传输任意数据。
 *
 * 这只是一个简单的封装WebRTC API的示例步骤。实际封装过程中，还需要处理各种事件和错误处理，以及实现其他功能，如音视频编解码、媒体流控制等。
 *
 * 需要注意的是，WebRTC API在不同的浏览器中可能有所不同，因此在封装时需要考虑到浏览器兼容性。可以使用适配器库（例如webrtc-adapter）来处理不同浏览器之间的差异。
 *
 * 希望以上信息对你有所帮助！
 */
const ICESERVERS = [
  {
    urls: "stun:192.168.0.220:3478",
  },
  {
    urls: ["turn:192.168.0.220:3478"],
    username: "kurento",
    credential: "kurento",
  },
];
const MEDIA_CONSTRAINT = { audio: true, video: true };
export default class WebRtcPeer {
  rtcPeerConnection;
  dataChannel;

  constructor(config) {
    //新建RTCPeerConnection
    this.rtcPeerConnection = new RTCPeerConnection({
      iceServers: this.config?.iceServers || ICESERVERS,
    });
    /**
     * 当 datachannel 事件在 RTCPeerConnection 发生时，它指定的那个事件处理函数就会被调用。
     * 这个事件继承于 RTCDataChannelEvent，当远方伙伴调用 createDataChannel() 时这个事件被加到这个连接（RTCPeerConnection）中
     * */
    this.dataChannel = this.rtcPeerConnection.createDataChannel(`webrtc-${new Date().getTime()}`);
    //
    this.dataChannel.onopen = (event) => {
      console.log(`dataChannel opened:${event}`);
    };
    //
    this.dataChannel.onmessage = (message) => {
      console.log(`Received message: ${message.data}`);
    };
    //
    this.dataChannel.onclose = (event) => {
      console.log(`dataChannel closed:${event}`);
    };
    //
    this.dataChannel.onerror = (event) => {
      console.error(`dataChannel error:${event}`);
    };
    //
    this.rtcPeerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
    };

    // 监听 RTCPeerConnection 的 onicecandidate 事件，当 ICE 服务器返回一个新的候选地址时，就会触发该事件
    this.rtcPeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("event=>", event, "icecandidate", event.candidate);
      }
    };
  }
  /**
   * 开始建立连接
   * 建立连接的主要过程：
   * 先是通过 RTCPeerConnection 对象的 createOffer 方法来创建本地的 SDP 描述，
   * 然后通过 RTCPeerConnection 对象的 setLocalDescription 方法来设置本地的 SDP 描述，
   * 最后通过 RTCPeerConnection 对象的 setRemoteDescription 方法来设置远程的 SDP 描述。
   * @returns 多媒体输出流
   */
  async connect() {
    //获取本地多媒体流
    const mediaStream = await navigator.mediaDevices.getUserMedia(this.config?.mediaConstraints || MEDIA_CONSTRAINT);
    //将流混入到rtcPeerConnection
    mediaStream.getTracks().forEach((track) => {
      this.rtcPeerConnection.addTrack(track, mediaStream);
    });
    //播放本地视频
    this.config.localeVideo.srcObject = mediaStream;
    //播放远程视频
    this.rtcPeerConnection.ontrack = (event) => (this.config.remoteVideo.srcObject = event.streams[0]);
    //创建本地的 SDP 描述
    const offer = await this.rtcPeerConnection.createOffer();
    //设置本地的 SDP 描述
    await this.rtcPeerConnection.setLocalDescription(offer);
    //设置远程的 SDP 描述,通过信令服务器发送 offerSdp 给远端
    // await this.rtcPeerConnection.setRemoteDescription()
    return mediaStream;
  }
  /**
   * TODO
   * 创建 answer
   * @param offer
   * @returns
   */
  async createAnwser(offer) {
    await this.rtcPeerConnection.setRemoteDescription(offer);
    const answer = await this.rtcPeerConnection.createAnswer();
    await this.rtcPeerConnection.setLocalDescription(answer);

    this.rtcPeerConnection.onicecandidate = (event) => {
      console.log(`locale description=> ${this.rtcPeerConnection.localDescription}`);
    };
    return answer;
  }
  /**
   * TODO
   * 处理anwser
   */
  async proccessAnwser(sdpAnswer, callback) {
    if (this.rtcPeerConnection.signalingState === "closed") {
      console.warn(`rtcPeerConnection 已经关闭了`);
      return;
    }
    await this.rtcPeerConnection.setRemoteDescription(
      new RTCSessionDescription({
        type: "answer",
        sdp: sdpAnswer,
      })
    );
    callback();
  }
  /**
   * TODO
   * 创建offer
   */
  async createOffer() {
    const offer = await this.rtcPeerConnection.createOffer();
    await this.rtcPeerConnection.setLocalDescription(offer);
    this.rtcPeerConnection.onicecandidate = (event) => {
      console.log(`locale description=> ${this.rtcPeerConnection.localDescription}`);
    };
  }

  sendMessage(message) {
    this.dataChannel?.send(message);
  }
}
