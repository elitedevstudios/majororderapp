import { create } from 'zustand';
import type { TimerState, TimerMode, TimerConfig } from '../types';

interface TimerStoreState extends TimerState {
  config: TimerConfig;
  
  // Actions
  startTimer: (taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  skipToNext: () => void;
  tick: () => void;
  setWorkDuration: (minutes: number) => void;
  
  // Queries
  getFormattedTime: () => string;
  getProgress: () => number;
  
  // Persistence
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
}

const DEFAULT_CONFIG: TimerConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

const getModeTime = (mode: TimerMode, config: TimerConfig): number => {
  switch (mode) {
    case 'work':
      return config.workMinutes * 60;
    case 'shortBreak':
      return config.shortBreakMinutes * 60;
    case 'longBreak':
      return config.longBreakMinutes * 60;
  }
};

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  mode: 'work',
  status: 'idle',
  timeRemaining: DEFAULT_CONFIG.workMinutes * 60,
  currentTaskId: null,
  pomodorosCompleted: 0,
  dailyPomodorosCompleted: 0,
  config: DEFAULT_CONFIG,

  startTimer: (taskId) => {
    const { mode, config, status } = get();
    if (status === 'running') return;
    
    set({
      status: 'running',
      currentTaskId: taskId || get().currentTaskId,
      timeRemaining: status === 'paused' ? get().timeRemaining : getModeTime(mode, config),
    });
    
    // Update tray
    window.electronAPI?.updateTimer(get().getFormattedTime());
  },

  pauseTimer: () => {
    if (get().status !== 'running') return;
    set({ status: 'paused' });
  },

  resumeTimer: () => {
    if (get().status !== 'paused') return;
    set({ status: 'running' });
  },

  stopTimer: () => {
    const { config } = get();
    set({
      status: 'idle',
      mode: 'work',
      timeRemaining: getModeTime('work', config),
      currentTaskId: null,
    });
    window.electronAPI?.updateTimer('');
  },

  skipToNext: () => {
    const { mode, pomodorosCompleted, config } = get();
    let nextMode: TimerMode;
    let newPomodorosCompleted = pomodorosCompleted;
    let newDailyPomodoros = get().dailyPomodorosCompleted;

    if (mode === 'work') {
      newPomodorosCompleted++;
      newDailyPomodoros++;
      
      if (newPomodorosCompleted % config.longBreakInterval === 0) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'shortBreak';
      }
    } else {
      nextMode = 'work';
    }

    set({
      mode: nextMode,
      status: 'idle',
      timeRemaining: getModeTime(nextMode, config),
      pomodorosCompleted: newPomodorosCompleted,
      dailyPomodorosCompleted: newDailyPomodoros,
      currentTaskId: nextMode === 'work' ? null : get().currentTaskId,
    });
    
    window.electronAPI?.updateTimer('');
  },

  tick: () => {
    const { status, timeRemaining } = get();
    if (status !== 'running') return;

    if (timeRemaining <= 1) {
      // Timer complete - will be handled by component
      set({ timeRemaining: 0, status: 'idle' });
      return;
    }

    set({ timeRemaining: timeRemaining - 1 });
    window.electronAPI?.updateTimer(get().getFormattedTime());
  },

  setWorkDuration: (minutes) => {
    const newConfig = { ...get().config, workMinutes: minutes };
    set({ 
      config: newConfig,
      timeRemaining: get().mode === 'work' && get().status === 'idle' 
        ? minutes * 60 
        : get().timeRemaining,
    });
    get().saveConfig();
  },

  getFormattedTime: () => {
    const { timeRemaining, mode } = get();
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const icon = mode === 'work' ? '🍅' : '☕';
    return `${icon} ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  getProgress: () => {
    const { timeRemaining, mode, config } = get();
    const totalTime = getModeTime(mode, config);
    return ((totalTime - timeRemaining) / totalTime) * 100;
  },

  loadConfig: async () => {
    try {
      const config = await window.electronAPI.store.get('timerConfig') as TimerConfig | undefined;
      if (config) {
        set({ 
          config,
          timeRemaining: getModeTime('work', config),
        });
      }
    } catch (error) {
      console.error('Failed to load timer config:', error);
    }
  },

  saveConfig: async () => {
    try {
      await window.electronAPI.store.set('timerConfig', get().config);
    } catch (error) {
      console.error('Failed to save timer config:', error);
    }
  },
}));
