const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 关闭弹窗
  closePopup: (data) => ipcRenderer.send('close-popup', data),
});
