// const { ipcRenderer } = require('electron');

// 全局变量

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
    // // 初始化界面组件
    // initUI();
    
    // // 初始化语音合成
    // initSpeechSynthesis();
    
    // // // 加载历史记录
    // // loadCallHistory();
    
    // // 应用主题
    // applyTheme();
}

// function initUI() {
//     // 窗口控制按钮
//     document.getElementById('minimizeBtn').addEventListener('click', () => {
//         const { remote } = require('electron');
//         remote.getCurrentWindow().minimize();
//     });
    
//     document.getElementById('maximizeBtn').addEventListener('click', () => {
//         const { remote } = require('electron');
//         const win = remote.getCurrentWindow();
//         if (win.isMaximized()) {
//             win.unmaximize();
//         } else {
//             win.maximize();
//         }
//     });
    
//     document.getElementById('closeBtn').addEventListener('click', () => {
//         const { remote } = require('electron');
//         remote.getCurrentWindow().close();
//     });
    
//     // 标签切换
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             // 移除所有活动标签
//             document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
//             document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
//             // 添加活动类
//             btn.classList.add('active');
//             const tabId = btn.getAttribute('data-tab') + 'Tab';
//             document.getElementById(tabId).classList.add('active');
//         });
//     });
    
//     // 房间管理
//     document.getElementById('createRoomBtn').addEventListener('click', createRoom);
    
//     // 呼叫按钮
//     document.getElementById('callBtn').addEventListener('click', callNumber);
    
//     // 快速呼叫按钮
//     document.querySelectorAll('.quick-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             document.getElementById('numberInput').value = btn.textContent;
//             callNumber();
//         });
//     });
    
//     // // 历史记录操作
//     // document.getElementById('exportBtn').addEventListener('click', exportHistory);
//     // document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    
//     // 设置更改
//     document.getElementById('themeSelect').addEventListener('change', applyTheme);
//     document.getElementById('rateSlider').addEventListener('input', updateRateValue);
//     document.getElementById('volumeSlider').addEventListener('input', updateVolumeValue);
// }

// function initSpeechSynthesis() {
//     // 填充语音选择下拉框
//     const voiceSelect = document.getElementById('voiceSelect');
//     const voices = speechSynthesis.getVoices();
    
//     voices.forEach(voice => {
//         if (voice.lang.includes('zh')) {
//             const option = document.createElement('option');
//             option.value = voice.name;
//             option.textContent = `${voice.name} (${voice.lang})`;
//             voiceSelect.appendChild(option);
//         }
//     });
    
//     // 监听语音变化
//     speechSynthesis.onvoiceschanged = () => {
//         const newVoices = speechSynthesis.getVoices();
//         voiceSelect.innerHTML = '';
        
//         newVoices.forEach(voice => {
//             if (voice.lang.includes('zh')) {
//                 const option = document.createElement('option');
//                 option.value = voice.name;
//                 option.textContent = `${voice.name} (${voice.lang})`;
//                 voiceSelect.appendChild(option);
//             }
//         });
//     };
// }

// function createRoom() {
//     roomId = document.getElementById('roomId').value;
//     if (!roomId) {
//         showNotification('错误', '请输入房间号');
//         return;
//     }
    
//     // 生成二维码
//     const joinUrl = `${window.location.origin}?room=${roomId}`;
//     document.getElementById('qrcode').innerHTML = joinUrl;
    
//     // 设置PeerConnection
//     setupPeerConnection(true);
//     updateStatus('等待手机端连接...', false);
// }

// function setupPeerConnection(isOfferer) {
//     peerConnection = new RTCPeerConnection(configuration);
    
//     // 处理ICE候选
//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//             // 存储ICE候选到本地存储
//             storeSignalData('ice', event.candidate);
//         }
//     };
    
//     if (isOfferer) {
//         // 创建数据通道
//         dataChannel = peerConnection.createDataChannel('callChannel');
//         setupDataChannel();
        
//         // 创建offer
//         peerConnection.createOffer()
//             .then(offer => peerConnection.setLocalDescription(offer))
//             .then(() => {
//                 // 存储offer到本地存储
//                 storeSignalData('offer', peerConnection.localDescription);
//                 checkForAnswer();
//             });
//     } else {
//         // 监听数据通道
//         peerConnection.ondatachannel = (event) => {
//             dataChannel = event.channel;
//             setupDataChannel();
//         };
        
//         // 获取offer
//         checkForOffer();
//     }
    
//     // 检查ICE候选
//     checkForIceCandidates();
// }

// function setupDataChannel() {
//     dataChannel.onopen = () => {
//         updateStatus('已连接', true);
//     };
    
//     dataChannel.onclose = () => {
//         updateStatus('连接已断开', false);
//     };
    
//     dataChannel.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.type === 'call') {
//             speakNumber(data.number);
//             // addToHistory(data.number);
//         }
//     };
// }

// function callNumber() {
//     const number = document.getElementById('numberInput').value;
//     if (!number) {
//         showNotification('错误', '请输入号码');
//         return;
//     }
    
//     if (dataChannel && dataChannel.readyState === 'open') {
//         dataChannel.send(JSON.stringify({
//             type: 'call',
//             number: number,
//             timestamp: new Date().toISOString()
//         }));
        
//         // 本地也显示
//         document.getElementById('currentNumber').textContent = number;
//         speakNumber(number);
//         // addToHistory(number);
//     } else {
//         showNotification('错误', '尚未建立连接');
//     }
// }

// function speakNumber(number) {
//     if ('speechSynthesis' in window) {
//         const utterance = new SpeechSynthesisUtterance(`请${number}号到办公室来`);
        
//         // 设置语音参数
//         const voiceSelect = document.getElementById('voiceSelect');
//         const voices = speechSynthesis.getVoices();
//         const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
        
//         if (selectedVoice) {
//             utterance.voice = selectedVoice;
//         }
        
//         utterance.rate = parseFloat(document.getElementById('rateSlider').value);
//         utterance.volume = parseFloat(document.getElementById('volumeSlider').value);
//         utterance.lang = 'zh-CN';
        
//         speechSynthesis.speak(utterance);
        
//         // 更新当前呼叫显示
//         document.getElementById('currentNumber').textContent = number;
//     } else {
//         showNotification('错误', '您的浏览器不支持语音合成功能');
//     }
// }

// // function addToHistory(number) {
// //     const timestamp = new Date().toLocaleString();
// //     callHistory.unshift({ number, timestamp });
    
// //     // 保存到本地存储
// //     localStorage.setItem('callHistory', JSON.stringify(callHistory));
    
// //     // 更新界面
// //     updateHistoryDisplay();
// // }

// // function loadCallHistory() {
// //     const savedHistory = localStorage.getItem('callHistory');
// //     if (savedHistory) {
// //         callHistory = JSON.parse(savedHistory);
// //         updateHistoryDisplay();
// //     }
// // }

// // function updateHistoryDisplay() {
// //     const historyList = document.getElementById('historyList');
// //     historyList.innerHTML = '';
    
// //     callHistory.forEach(item => {
// //         const row = document.createElement('tr');
        
// //         const timeCell = document.createElement('td');
// //         timeCell.textContent = item.timestamp;
        
// //         const numberCell = document.createElement('td');
// //         numberCell.textContent = item.number;
        
// //         const actionCell = document.createElement('td');
// //         const callAgainBtn = document.createElement('button');
// //         callAgainBtn.textContent = '再次呼叫';
// //         callAgainBtn.classList.add('btn-secondary');
// //         callAgainBtn.addEventListener('click', () => {
// //             document.getElementById('numberInput').value = item.number;
// //             callNumber();
// //         });
        
// //         actionCell.appendChild(callAgainBtn);
        
// //         row.appendChild(timeCell);
// //         row.appendChild(numberCell);
// //         row.appendChild(actionCell);
        
// //         historyList.appendChild(row);
// //     });
// // }

// // function exportHistory() {
// //     if (callHistory.length === 0) {
// //         showNotification('提示', '没有历史记录可导出');
// //         return;
// //     }
    
// //     // 生成CSV内容
// //     let csvContent = "时间,号码\n";
// //     callHistory.forEach(item => {
// //         csvContent += `"${item.timestamp}","${item.number}"\n`;
// //     });
    
// //     // 使用Electron的对话框保存文件
// //     ipcRenderer.invoke('show-save-dialog', '呼叫历史.csv')
// //         .then(result => {
// //             if (!result.canceled && result.filePath) {
// //                 const fs = require('fs');
// //                 fs.writeFileSync(result.filePath, csvContent, 'utf8');
// //                 showNotification('成功', '历史记录已导出');
// //             }
// //         });
// // }

// // function clearHistory() {
// //     if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
// //         callHistory = [];
// //         localStorage.removeItem('callHistory');
// //         updateHistoryDisplay();
// //         showNotification('成功', '历史记录已清空');
// //     }
// // }

// function applyTheme() {
//     const theme = document.getElementById('themeSelect').value;
//     let actualTheme = theme;
    
//     if (theme === 'auto') {
//         // 检测系统主题
//         const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
//         actualTheme = darkMode ? 'dark' : 'light';
//     }
    
//     document.documentElement.setAttribute('data-theme', actualTheme);
// }

// function updateRateValue() {
//     document.getElementById('rateValue').textContent = document.getElementById('rateSlider').value;
// }

// function updateVolumeValue() {
//     document.getElementById('volumeValue').textContent = document.getElementById('volumeSlider').value;
// }

// function updateStatus(message, isConnected) {
//     document.getElementById('statusText').textContent = message;
//     const statusDot = document.getElementById('connectionStatus');
//     statusDot.classList.remove('connected', 'disconnected');
//     statusDot.classList.add(isConnected ? 'connected' : 'disconnected');
// }

// function showNotification(title, body) {
//     ipcRenderer.invoke('show-notification', title, body);
// }

// // 存储和获取信令数据的辅助函数
// function storeSignalData(type, data) {
//     const key = `${roomId}_${type}`;
//     localStorage.setItem(key, JSON.stringify(data));
// }

// function getSignalData(type) {
//     const key = `${roomId}_${type}`;
//     const data = localStorage.getItem(key);
//     return data ? JSON.parse(data) : null;
// }

// function clearSignalData(type) {
//     const key = `${roomId}_${type}`;
//     localStorage.removeItem(key);
// }

// function checkForOffer() {
//     const offer = getSignalData('offer');
//     if (offer) {
//         peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
//             .then(() => peerConnection.createAnswer())
//             .then(answer => peerConnection.setLocalDescription(answer))
//             .then(() => {
//                 storeSignalData('answer', peerConnection.localDescription);
//                 clearSignalData('offer');
//             });
//     } else {
//         setTimeout(checkForOffer, 1000);
//     }
// }

// function checkForAnswer() {
//     const answer = getSignalData('answer');
//     if (answer) {
//         peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
//             .then(() => clearSignalData('answer'));
//     } else {
//         setTimeout(checkForAnswer, 1000);
//     }
// }

// function checkForIceCandidates() {
//     const ice = getSignalData('ice');
//     if (ice) {
//         peerConnection.addIceCandidate(new RTCIceCandidate(ice))
//             .then(() => clearSignalData('ice'));
//     }
//     setTimeout(checkForIceCandidates, 1000);
// }
