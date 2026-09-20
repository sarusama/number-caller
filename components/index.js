// 建立与服务器的连接
const textRoomId = document.getElementById('text-room-id');
const statusElement = document.getElementById('status');
const roomIdDiv = document.getElementById('room-id-div');
const editButton = document.getElementById('edit-button');
const inputRoom = document.getElementById('input-room');

let localStorageRoomId = localStorage.getItem('roomId');
// const websocketURL = 'ws://2.136.15.67:3000';
const websocketURL = 'ws://2.136.15.93:3000';
// const websocketURL = 'ws://dis-macbook-pro.local:3000';
let socket = null;
const pc = new RTCPeerConnection();
let streamMedia = null;
let senders = [];

if (localStorageRoomId) {
    textRoomId.textContent = localStorageRoomId;
    inputRoom.style.display = 'none';
} else {
    textRoomId.textContent = '-';
    roomIdDiv.style.display = 'none';
}

// 编辑
const edit = () => {
    roomIdDiv.style.display = 'none';
    inputRoom.style.display = 'flex';
};

// 确认
const confirm = () => {
    const roomId = document.getElementById('room-id').value;
    localStorage.setItem('roomId', roomId);
    localStorageRoomId = roomId;
    textRoomId.textContent = roomId;

    roomIdDiv.style.display = 'flex';
    inputRoom.style.display = 'none';
};

function connect() {
    // console.log('connect');
    socket = new WebSocket(websocketURL);

    socket.onopen = () => {
        console.log('连接成功');
        statusElement.textContent = '已连接';
        statusElement.style.color = 'green';

        // // 连接成功了之后创建端对端连接
        // createPCOffer();
    };

    socket.onmessage = async (event) => {
        console.log('收到消息', event);
        const message = JSON.parse(event.data);
        if (localStorageRoomId.toString() === message.to) {
            if (message.type === 'callNumber') {
              speakNumber(message.data);

              window.electronAPI.showPopup({
                from: message.from,
                message: message.data,
              });

              socket.send(JSON.stringify({
                type: 'sendMessageSuccess',
                from: localStorageRoomId,
                to: message.from,
              }));

                window.electronAPI.once('send-to-main', (data) => {
                    socket.send(JSON.stringify({
                        type: 'known',
                        from: localStorageRoomId,
                        to: data.from,
                    }));
                });
            } else if (message.type === 'sendWebRTCOffer') {
              await pc.setRemoteDescription(message.data);
              console.log(pc.signalingState);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              console.log(pc.signalingState);

              // 将 answer.sdp 发送回 A
              socket.send(JSON.stringify({
                  type: 'sendWebRTCAnswer',
                  from: localStorageRoomId,
                  to: message.from,
                  data: answer,
              }));

              console.log('pc', pc.connectionState, pc.localDescription, pc.remoteDescription);
            } else if (message.type === 'iceCandidate') {
                await pc.addIceCandidate(new RTCIceCandidate(message.data));
            } else if (message.type === 'iceCandidateComplete') {
                console.log('交换完成');
            } else if (message.type === 'openCamera') {
                streamMedia = await navigator
                    .mediaDevices
                    .getUserMedia({ video: true, audio: true });

                senders = pc.getSenders();

                console.log('senders', senders);

                streamMedia.getTracks().forEach(async (track) => {
                    const sender = senders.find((sender) => sender.track.kind === track.kind);
                    if (sender) {
                        await sender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, streamMedia);
                    }
                });

                socket.send(JSON.stringify({
                    type: 'openedCamera',
                    from: localStorageRoomId,
                    to: message.from,
                }));
            } else if (message.type === 'closeCamera') {
                streamMedia.getTracks().forEach((track) => {
                    track.stop();
                });

                streamMedia = null;
                socket.send(JSON.stringify({
                    type: 'closedCamera',
                    from: localStorageRoomId,
                    to: message.from,
                }));
            }
        }
    };

    socket.onclose = () => {
        console.log('连接关闭');
        statusElement.textContent = '连接断开，重连中...';
        statusElement.style.color = 'red';

        setTimeout(() => {
            connect();
        }, 1000);
    };

    socket.onerror = (error) => {
        console.log('连接错误', error);
    };

    setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
            console.log('连接超时');

            socket.close();
        }
    }, 10000);
}

// 使用Web Speech API朗读文本
function speakNumber(num) {
    const utterance = new SpeechSynthesisUtterance(num);
    utterance.lang = 'zh-CN'; // 设置中文语音
    utterance.rate = 1.0; // 语速
    speechSynthesis.speak(utterance);
}


function createPCOffer() {
    pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        // console.log('offer', offer);
        // // 将 offer.sdp 发送给 B（通过信令服务器/手动复制）
        // socket.emit('sendWebRTCOffer', { offer });
        socket.send(JSON.stringify({
            type: 'sendWebRTCOffer',
            from: localStorageRoomId,
            to: '',
            data: {
                offer,
            },
        }));
    });
}

pc.onicecandidate = (event) => {
    console.log('icecandidate', event);
};

pc.onicegatheringstatechange = (event) => {
    console.log('onicegatheringstatechange', event);
};

pc.oniceconnectionstatechange = (event) => {
    console.log('oniceconnectionstatechange', event)
};

pc.onicecandidateerror = (event) => {
    console.log('onicecandidateerror', event);
};

window.addEventListener('message', () => {
  console.log('message');
});

// socket.on('getWebRTCAnswer', (data) => {
//     console.log('web rtc', data);
//     pc.setRemoteDescription({ type: 'answer', sdp: data.answer.sdp });
//     const channel = pc.createDataChannel("chat");
//     channel.onopen = () => {
//         channel.onmessage = e => console.log("收到消息:", e.data);
//         channel.send('已连接');
//     };
// });

connect();
