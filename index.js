const { app, BrowserWindow, ipcMain, dialog, Notification, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      allowRunningInsecureContent: false,
      offscreen: true,
    },
    show: false // 先不显示，等准备好再显示
  });

  // // 加载应用
  // mainWindow.loadFile('index.html');
  mainWindow.loadURL('http://1.1.3.95:3000/');
  // mainWindow.loadURL('http://numbercaller.window:432/');

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  tray = new Tray(path.join(__dirname, 'transparent.png'));

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '退出',
      click:()=>{
        mainWindow.close();
      }
    },
  ])
  // 点击图标展示
  tray.on('click',() => {
    mainWindow.show();
  });
  // 鼠标放置上去显示的文本
  tray.setToolTip('叫号系统');
  tray.setContextMenu(contextMenu);
}

app.commandLine.appendSwitch('disable-site-isolation-trials');

// 应用准备就绪
app.whenReady().then(createWindow);

app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
});

// 所有窗口关闭时
app.on('window-all-closed', () => {
  // 在macOS上，应用通常保持活动状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当单击停靠图标并且没有其他窗口打开时，
  // 通常会在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

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
