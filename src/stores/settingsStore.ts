import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  workMinutes: number;
  
  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setWorkMinutes: (minutes: number) => void;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  workMinutes: 25,

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    get().saveToStorage();
  },

  setWorkMinutes: (minutes) => {
    set({ workMinutes: minutes });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const settings = await window.electronAPI.store.get('settings') as Partial<SettingsState> | undefined;
      if (settings) {
        set({
          soundEnabled: settings.soundEnabled ?? true,
          workMinutes: settings.workMinutes ?? 25,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { soundEnabled, workMinutes } = get();
      await window.electronAPI.store.set('settings', {
        soundEnabled,
        workMinutes,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
