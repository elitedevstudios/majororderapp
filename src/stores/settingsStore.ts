import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  dailyPointGoal: number;
  weeklyPointGoal: number;
  
  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyPointGoal: (goal: number) => void;
  setWeeklyPointGoal: (goal: number) => void;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  notificationsEnabled: true,
  dailyPointGoal: 100,
  weeklyPointGoal: 500,

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    get().saveToStorage();
  },

  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().saveToStorage();
  },

  setDailyPointGoal: (goal) => {
    set({ dailyPointGoal: goal });
    get().saveToStorage();
  },

  setWeeklyPointGoal: (goal) => {
    set({ weeklyPointGoal: goal });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const settings = await window.electronAPI.store.get('settings') as Partial<SettingsState> | undefined;
      if (settings) {
        set({
          soundEnabled: settings.soundEnabled ?? true,
          notificationsEnabled: settings.notificationsEnabled ?? true,
          dailyPointGoal: settings.dailyPointGoal ?? 100,
          weeklyPointGoal: settings.weeklyPointGoal ?? 500,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { soundEnabled, notificationsEnabled, dailyPointGoal, weeklyPointGoal } = get();
      await window.electronAPI.store.set('settings', {
        soundEnabled,
        notificationsEnabled,
        dailyPointGoal,
        weeklyPointGoal,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
