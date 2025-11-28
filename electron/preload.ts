import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  
  // Timer updates for tray
  updateTimer: (time: string, status: 'idle' | 'running' | 'paused') => 
    ipcRenderer.send('timer:update', { time, status }),
  
  // Streak updates for tray
  updateStreak: (streak: number) => ipcRenderer.send('streak:update', streak),
  
  // Window controls
  toggleAlwaysOnTop: () => ipcRenderer.send('toggle-always-on-top'),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  
  // Listen for tray events
  onTrayToggleTimer: (callback: () => void) => {
    ipcRenderer.on('tray:toggle-timer', callback);
    return () => ipcRenderer.removeListener('tray:toggle-timer', callback);
  },
});

// Type declarations for renderer
declare global {
  interface Window {
    electronAPI: {
      store: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
      updateTimer: (time: string, status: 'idle' | 'running' | 'paused') => void;
      updateStreak: (streak: number) => void;
      toggleAlwaysOnTop: () => void;
      getAlwaysOnTop: () => Promise<boolean>;
      onTrayToggleTimer: (callback: () => void) => () => void;
    };
  }
}
