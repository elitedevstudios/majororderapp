import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  
  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  notificationsEnabled: true,

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    get().saveToStorage();
  },

  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const settings = await window.electronAPI.store.get('settings') as Partial<SettingsState> | undefined;
      if (settings) {
        set({
          soundEnabled: settings.soundEnabled ?? true,
          notificationsEnabled: settings.notificationsEnabled ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { soundEnabled, notificationsEnabled } = get();
      await window.electronAPI.store.set('settings', {
        soundEnabled,
        notificationsEnabled,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
