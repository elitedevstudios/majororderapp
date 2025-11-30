import { create } from 'zustand';
import type { StopwatchState, PointsConfig, Priority } from '../types';

interface StopwatchStoreState extends StopwatchState {
  totalPoints: number;
  dailyPoints: number;
  tasksUnderEstimate: number; // Track for badge
  
  // Actions
  startStopwatch: (taskId: string) => void;
  pauseStopwatch: () => void;
  resumeStopwatch: () => void;
  stopStopwatch: () => { elapsedSeconds: number };
  tick: () => void;
  
  // Points
  calculatePoints: (estimatedMinutes: number | undefined, actualSeconds: number, priority: Priority) => number;
  addPoints: (points: number, wasUnderEstimate: boolean) => void;
  
  // Queries
  getFormattedTime: () => string;
  getActiveTaskId: () => string | null;
  isTaskActive: (taskId: string) => boolean;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const DEFAULT_POINTS_CONFIG: PointsConfig = {
  basePoints: 10,
  earlyBonus: 2.0, // 2x multiplier for finishing early
  priorityMultiplier: {
    high: 3,
    medium: 2,
    low: 1,
  },
};

export const useStopwatchStore = create<StopwatchStoreState>((set, get) => ({
  status: 'idle',
  activeTaskId: null,
  elapsedSeconds: 0,
  startedAt: null,
  totalPoints: 0,
  dailyPoints: 0,
  tasksUnderEstimate: 0,

  startStopwatch: (taskId: string) => {
    const { status, activeTaskId } = get();
    
    // If already running on same task, do nothing
    if (status === 'running' && activeTaskId === taskId) return;
    
    // If running on different task, stop first (shouldn't happen with UI)
    if (status === 'running' && activeTaskId !== taskId) {
      get().stopStopwatch();
    }
    
    set({
      status: 'running',
      activeTaskId: taskId,
      elapsedSeconds: 0,
      startedAt: Date.now(),
    });
    
    window.electronAPI?.updateTimer(get().getFormattedTime(), 'running');
  },

  pauseStopwatch: () => {
    if (get().status !== 'running') return;
    set({ status: 'paused' });
    window.electronAPI?.updateTimer(get().getFormattedTime(), 'paused');
  },

  resumeStopwatch: () => {
    if (get().status !== 'paused') return;
    set({ 
      status: 'running',
      startedAt: Date.now() - (get().elapsedSeconds * 1000),
    });
    window.electronAPI?.updateTimer(get().getFormattedTime(), 'running');
  },

  stopStopwatch: () => {
    const elapsed = get().elapsedSeconds;
    set({
      status: 'idle',
      activeTaskId: null,
      elapsedSeconds: 0,
      startedAt: null,
    });
    window.electronAPI?.updateTimer('', 'idle');
    return { elapsedSeconds: elapsed };
  },

  tick: () => {
    const { status, startedAt } = get();
    if (status !== 'running' || !startedAt) return;
    
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    set({ elapsedSeconds: elapsed });
    window.electronAPI?.updateTimer(get().getFormattedTime(), 'running');
  },

  calculatePoints: (estimatedMinutes, actualSeconds, priority) => {
    const config = DEFAULT_POINTS_CONFIG;
    let points = config.basePoints;
    
    // Apply priority multiplier
    points *= config.priorityMultiplier[priority];
    
    // Apply early completion bonus
    if (estimatedMinutes) {
      const estimatedSeconds = estimatedMinutes * 60;
      if (actualSeconds < estimatedSeconds) {
        // Bonus scales with how much time was saved (up to 2x)
        const timeRatio = actualSeconds / estimatedSeconds;
        const bonusMultiplier = 1 + ((1 - timeRatio) * config.earlyBonus);
        points *= bonusMultiplier;
      }
    }
    
    return Math.round(points);
  },

  addPoints: (points, wasUnderEstimate) => {
    const { totalPoints, dailyPoints, tasksUnderEstimate } = get();
    set({
      totalPoints: totalPoints + points,
      dailyPoints: dailyPoints + points,
      tasksUnderEstimate: wasUnderEstimate ? tasksUnderEstimate + 1 : tasksUnderEstimate,
    });
    get().saveToStorage();
  },

  getFormattedTime: () => {
    const { elapsedSeconds } = get();
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    if (hours > 0) {
      return `⏱️ ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  getActiveTaskId: () => get().activeTaskId,

  isTaskActive: (taskId: string) => {
    return get().activeTaskId === taskId && get().status === 'running';
  },

  loadFromStorage: async () => {
    try {
      const data = await window.electronAPI.store.get('stopwatchData') as {
        totalPoints: number;
        dailyPoints: number;
        dailyDate: string;
        tasksUnderEstimate: number;
      } | undefined;
      
      const today = new Date().toISOString().split('T')[0];
      
      if (data) {
        set({
          totalPoints: data.totalPoints || 0,
          dailyPoints: data.dailyDate === today ? data.dailyPoints : 0,
          tasksUnderEstimate: data.tasksUnderEstimate || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load stopwatch data:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await window.electronAPI.store.set('stopwatchData', {
        totalPoints: get().totalPoints,
        dailyPoints: get().dailyPoints,
        dailyDate: today,
        tasksUnderEstimate: get().tasksUnderEstimate,
      });
    } catch (error) {
      console.error('Failed to save stopwatch data:', error);
    }
  },
}));

// Keep old export name for compatibility during transition
export const useTimerStore = useStopwatchStore;
