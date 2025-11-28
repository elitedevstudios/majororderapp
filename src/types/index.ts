// Task Types
export interface Task {
  id: string;
  title: string;
  priority: Priority;
  order: number;
  completed: boolean;
  completedAt?: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  pomodorosSpent: number;
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

// Timer Types
export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number; // in seconds
  currentTaskId: string | null;
  pomodorosCompleted: number;
  dailyPomodorosCompleted: number;
}

export interface TimerConfig {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
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
  | 'time-lord'
  | 'sniper';

// Settings Types
export interface Settings {
  workMinutes: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// Time Feedback Types
export type TimeFeedback = {
  type: 'under' | 'on-target' | 'over';
  message: string;
  difference: number;
};

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
