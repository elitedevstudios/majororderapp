import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import Store from 'electron-store';

const store = new Store();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAlwaysOnTop = false;

const DIST = path.join(__dirname, '../dist');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 700,
    minWidth: 380,
    minHeight: 500,
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1c2c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(DIST, 'index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  const iconPath = path.join(__dirname, '../src/assets/images/tray-icon.png');
  tray = new Tray(nativeImage.createEmpty());
  
  updateTrayMenu();
  
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}

function updateTrayMenu(timerText?: string): void {
  if (!tray) return;
  
  const title = timerText || '⏱️';
  tray.setTitle(title);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Major Order', click: () => mainWindow?.show() },
    { type: 'separator' },
    { 
      label: 'Always on Top', 
      type: 'checkbox', 
      checked: isAlwaysOnTop,
      click: () => toggleAlwaysOnTop()
    },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      (app as any).isQuitting = true;
      app.quit();
    }}
  ]);
  
  tray.setContextMenu(contextMenu);
}

function toggleAlwaysOnTop(): void {
  isAlwaysOnTop = !isAlwaysOnTop;
  mainWindow?.setAlwaysOnTop(isAlwaysOnTop);
  updateTrayMenu();
}

// IPC Handlers
ipcMain.handle('store:get', (_, key: string) => store.get(key));
ipcMain.handle('store:set', (_, key: string, value: unknown) => store.set(key, value));
ipcMain.handle('store:delete', (_, key: string) => store.delete(key));

ipcMain.on('timer:update', (_, timeText: string) => {
  updateTrayMenu(timeText);
});

ipcMain.on('toggle-always-on-top', () => {
  toggleAlwaysOnTop();
});

ipcMain.handle('get-always-on-top', () => isAlwaysOnTop);

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  (app as any).isQuitting = true;
});
