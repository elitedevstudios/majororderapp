// Task Types
export interface Task {
  id: string;
  title: string;
  notes?: string; // Optional task notes/description
  priority: Priority;
  order: number;
  completed: boolean;
  completedAt?: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  elapsedSeconds: number; // Total time tracked via stopwatch
  pointsEarned: number; // Points earned for this task
  createdAt: number;
  isRecurring: boolean;
  recurringTemplateId?: string;
}

export type Priority = 'low' | 'medium' | 'high';

// Recurring Task Types
export interface RecurringTask {
  id: string;
  title: string;
  priority: Priority;
  estimatedMinutes?: number;
  frequency: 'daily' | 'weekly';
  dayOfWeek?: number; // 0-6 for weekly tasks
  lastGenerated?: string; // ISO date string
  isActive: boolean;
}

// Stopwatch Types
export type StopwatchStatus = 'idle' | 'running' | 'paused';

export interface StopwatchState {
  status: StopwatchStatus;
  activeTaskId: string | null;
  elapsedSeconds: number; // Current session elapsed time
  startedAt: number | null; // Timestamp when started
}

// Points System
export interface PointsConfig {
  basePoints: number; // Points for completing any task
  earlyBonus: number; // Multiplier for finishing under estimate
  priorityMultiplier: {
    high: number;
    medium: number;
    low: number;
  };
}

// Streak Types
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string; // ISO date string
  totalTasksCompleted: number;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: number;
}

export type BadgeId = 
  | 'first-blood'
  | 'on-fire'
  | 'unstoppable'
  | 'legend'
  | 'centurion'
  | 'speed-demon' // Complete 5 tasks under estimated time
  | 'time-master' // Earn 1000 total points
  | 'sniper';

// Settings Types
export interface Settings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// Time Feedback Types
export type TimeFeedback = {
  type: 'under' | 'on-target' | 'over';
  message: string;
  difference: number;
};

// Weekly Stats Types
export interface PriorityBreakdown {
  high: number;
  medium: number;
  low: number;
}

export interface DayStats {
  date: string;
  dayName: string;
  count: number;
  regular: PriorityBreakdown;
  recurring: PriorityBreakdown;
}

// Electron API Types
export interface ElectronAPI {
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
