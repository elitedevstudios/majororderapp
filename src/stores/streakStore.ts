import { create } from 'zustand';
import type { StreakData, Badge, BadgeId } from '../types';

interface StreakStoreState extends StreakData {
  badges: Badge[];
  
  // Actions
  checkAndUpdateStreak: (allTasksComplete: boolean) => void;
  incrementTasksCompleted: () => void;
  checkBadgeUnlock: (context: BadgeContext) => Badge | null;
  resetStreak: () => void;
  
  // Queries
  getStreakStatus: () => StreakStatus;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

interface StreakStatus {
  isActive: boolean;      // Has an active streak (completed yesterday or today)
  isPending: boolean;     // Completed yesterday, waiting for today
  isCompletedToday: boolean;
  potentialStreak: number; // What streak will be after completing today
}

interface BadgeContext {
  tasksCompleted?: number;
  currentStreak?: number;
  dailyPomodoros?: number;
  completedUnderEstimate?: boolean;
}

const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first task',
    icon: '🎖️',
    condition: 'Complete 1 task',
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: '3-day streak achieved',
    icon: '🔥',
    condition: '3-day streak',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '7-day streak achieved',
    icon: '⚡',
    condition: '7-day streak',
  },
  {
    id: 'legend',
    name: 'Legend',
    description: '30-day streak achieved',
    icon: '👑',
    condition: '30-day streak',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 tasks',
    icon: '💯',
    condition: '100 tasks completed',
  },
  {
    id: 'time-lord',
    name: 'Time Lord',
    description: '10 pomodoros in one day',
    icon: '⏱️',
    condition: '10 daily pomodoros',
  },
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'Complete a task under estimated time',
    icon: '🎯',
    condition: 'Beat your estimate',
  },
];

const getToday = (): string => new Date().toISOString().split('T')[0];

export const useStreakStore = create<StreakStoreState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: undefined,
  totalTasksCompleted: 0,
  badges: BADGE_DEFINITIONS.map(b => ({ ...b })),

  checkAndUpdateStreak: (allTasksComplete) => {
    const today = getToday();
    const { lastCompletedDate, currentStreak, longestStreak } = get();
    
    if (!allTasksComplete) return;
    
    // Already completed today
    if (lastCompletedDate === today) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak: number;
    
    if (lastCompletedDate === yesterdayStr) {
      // Continuing streak
      newStreak = currentStreak + 1;
    } else if (!lastCompletedDate) {
      // First day
      newStreak = 1;
    } else {
      // Streak broken - reset
      newStreak = 1;
    }
    
    set({
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastCompletedDate: today,
    });
    
    // Check for streak badges
    get().checkBadgeUnlock({ currentStreak: newStreak });
    get().saveToStorage();
  },

  incrementTasksCompleted: () => {
    const newTotal = get().totalTasksCompleted + 1;
    set({ totalTasksCompleted: newTotal });
    get().checkBadgeUnlock({ tasksCompleted: newTotal });
    get().saveToStorage();
  },

  checkBadgeUnlock: (context) => {
    const { badges } = get();
    let unlockedBadge: Badge | null = null;
    
    const updatedBadges = badges.map((badge) => {
      if (badge.unlockedAt) return badge; // Already unlocked
      
      let shouldUnlock = false;
      
      switch (badge.id as BadgeId) {
        case 'first-blood':
          shouldUnlock = (context.tasksCompleted ?? 0) >= 1;
          break;
        case 'on-fire':
          shouldUnlock = (context.currentStreak ?? 0) >= 3;
          break;
        case 'unstoppable':
          shouldUnlock = (context.currentStreak ?? 0) >= 7;
          break;
        case 'legend':
          shouldUnlock = (context.currentStreak ?? 0) >= 30;
          break;
        case 'centurion':
          shouldUnlock = (context.tasksCompleted ?? 0) >= 100;
          break;
        case 'time-lord':
          shouldUnlock = (context.dailyPomodoros ?? 0) >= 10;
          break;
        case 'sniper':
          shouldUnlock = context.completedUnderEstimate === true;
          break;
      }
      
      if (shouldUnlock) {
        unlockedBadge = { ...badge, unlockedAt: Date.now() };
        return unlockedBadge;
      }
      
      return badge;
    });
    
    if (unlockedBadge) {
      set({ badges: updatedBadges });
      get().saveToStorage();
    }
    
    return unlockedBadge;
  },

  resetStreak: () => {
    set({ currentStreak: 0 });
    get().saveToStorage();
  },

  getStreakStatus: () => {
    const { currentStreak, lastCompletedDate } = get();
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const isCompletedToday = lastCompletedDate === today;
    const completedYesterday = lastCompletedDate === yesterdayStr;
    const isActive = isCompletedToday || completedYesterday;
    const isPending = completedYesterday && !isCompletedToday;
    
    // Calculate what the streak will be after completing today
    let potentialStreak: number;
    if (isCompletedToday) {
      potentialStreak = currentStreak; // Already at max for today
    } else if (completedYesterday) {
      potentialStreak = currentStreak + 1; // Will increment
    } else {
      potentialStreak = 1; // Will start fresh
    }
    
    return {
      isActive,
      isPending,
      isCompletedToday,
      potentialStreak,
    };
  },

  loadFromStorage: async () => {
    try {
      const streakData = await window.electronAPI.store.get('streakData') as Partial<StreakStoreState> | undefined;
      if (streakData) {
        // Merge saved badges with definitions (in case new badges were added)
        const savedBadges = streakData.badges || [];
        const mergedBadges = BADGE_DEFINITIONS.map((def) => {
          const saved = savedBadges.find((b: Badge) => b.id === def.id);
          return saved ? { ...def, unlockedAt: saved.unlockedAt } : { ...def };
        });
        
        set({
          currentStreak: streakData.currentStreak ?? 0,
          longestStreak: streakData.longestStreak ?? 0,
          lastCompletedDate: streakData.lastCompletedDate,
          totalTasksCompleted: streakData.totalTasksCompleted ?? 0,
          badges: mergedBadges,
        });
        
        // Check if streak should be reset (missed yesterday)
        const today = getToday();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (streakData.lastCompletedDate && 
            streakData.lastCompletedDate !== today && 
            streakData.lastCompletedDate !== yesterdayStr) {
          // Streak broken - reset and persist
          set({ currentStreak: 0 });
          get().saveToStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { currentStreak, longestStreak, lastCompletedDate, totalTasksCompleted, badges } = get();
      await window.electronAPI.store.set('streakData', {
        currentStreak,
        longestStreak,
        lastCompletedDate,
        totalTasksCompleted,
        badges,
      });
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  },
}));
