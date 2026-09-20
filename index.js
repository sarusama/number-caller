const { app, BrowserWindow, session, ipcMain, dialog, Notification, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(['media', 'display-capture', 'audioCapture', 'videoCapture'].includes(permission));
  });


  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return ['media', 'display-capture', 'audioCapture', 'videoCapture'].includes(permission);
  });

  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'transparent.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload/index.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      webSecurity: false,
      allowRunningInsecureContent: false,
      offscreen: false,
    },
    show: false
  });

  mainWindow.webContents.setWebRTCIPHandlingPolicy('default_public_interface_only');

  // // 加载应用
  mainWindow.loadFile('main/index.html');
  // mainWindow.loadURL('http://1.1.3.95:3000/');
  // mainWindow.loadFile('webrtc.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // // 窗口关闭事件
  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // });

  tray = new Tray(path.join(__dirname, 'transparent.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: '退出',
      click:()=>{
        app.quit();
      }
    },
  ])
  // 点击图标展示
  tray.on('click',() => {
    mainWindow.show();
  });
  // 鼠标放置上去显示的文本
  tray.setToolTip('打开叫号系统');
  tray.setContextMenu(contextMenu);

  return mainWindow;
}

app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'WebRtcHideLocalIpsWithMdns');

function createPopup(closePopup) {
  let popup = null;
  // 监听渲染进程发来的弹窗请求
  ipcMain.on('show-popup', (event, data) => {
    // 创建弹窗窗口
    popup = new BrowserWindow({
      width: 450,
      height: 320,
      title: '',
      frame: false,            // ❌ 无边框（没有顶部栏）
      transparent: true,       // ✅ 透明背景
      resizable: false,        // 禁止拉伸（透明窗口拉伸容易糊）
      hasShadow: false,        // 透明窗口自带阴影容易出黑边，交给 CSS 画
      skipTaskbar: true,       // 不在任务栏显示
      alwaysOnTop: true,       // 置顶
      focusable: true,
      webPreferences: {
        // 弹窗内不需要 Node，直接内联 HTML 即可
        preload: path.join(__dirname, 'preload/popup.js'),
      }
    });

    // 用 data URL 加载内联页面
    popup.loadFile('main/popup/index.html', {
      query: {
        ...data,
      },
    });

    // 可选：5 秒后自动关闭
    // setTimeout(() => popup.close(), 5000)
  });

  ipcMain.on('close-popup', (event, data) => {
    popup.close();
    closePopup(data);
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  const mainWindow = createWindow();

  createPopup((data) => {
    mainWindow.webContents.send('send-to-main', data);
    // ipcMain.on('send-to-main', data);
  });
});

app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
});

// // 所有窗口关闭时
// app.on('window-all-closed', () => {
//   // 在macOS上，应用通常保持活动状态
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   // 在macOS上，当单击停靠图标并且没有其他窗口打开时，
//   // 通常会在应用程序中重新创建一个窗口。
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// IPC通信处理
ipcMain.handle('show-notification', (event, title, body) => {
  new Notification({ title, body }).show();
});

ipcMain.handle('show-save-dialog', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});
