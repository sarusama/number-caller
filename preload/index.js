const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 渲染进程调用此方法通知主进程弹窗
  showPopup: (data) => ipcRenderer.send('show-popup', data),
  // 关闭弹窗
  closeWinodw: () => ipcRenderer.send('close-popup'),
  once: (channel = 'send-to-main', callback) => {
    const listener = (event, payload) => callback(payload);
    ipcRenderer.on(channel, listener);
    // return () => ipcRenderer.removeListener('send-to-main', listener);
  },
});
