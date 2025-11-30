import { useTaskStore } from '../stores/taskStore';
import { useStreakStore } from '../stores/streakStore';
import { useStopwatchStore } from '../stores/timerStore';

interface ExportData {
  version: string;
  exportedAt: string;
  tasks: unknown[];
  recurringTasks: unknown[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalTasksCompleted: number;
  };
  points: {
    totalPoints: number;
    tasksUnderEstimate: number;
  };
}

/**
 * Export all app data as JSON for backup.
 */
export function exportAppData(): ExportData {
  const taskState = useTaskStore.getState();
  const streakState = useStreakStore.getState();
  const stopwatchState = useStopwatchStore.getState();

  return {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    tasks: taskState.tasks,
    recurringTasks: taskState.recurringTasks,
    streak: {
      currentStreak: streakState.currentStreak,
      longestStreak: streakState.longestStreak,
      totalTasksCompleted: streakState.totalTasksCompleted,
    },
    points: {
      totalPoints: stopwatchState.totalPoints,
      tasksUnderEstimate: stopwatchState.tasksUnderEstimate,
    },
  };
}

/**
 * Download app data as a JSON file.
 */
export function downloadBackup(): void {
  const data = exportAppData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `major-order-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get statistics summary for display.
 */
export function getStatsSummary(): {
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionTime: number | null;
} {
  const tasks = useTaskStore.getState().tasks;
  const streakState = useStreakStore.getState();
  const stopwatchState = useStopwatchStore.getState();

  const completedTasks = tasks.filter((t) => t.completed);
  const tasksWithTime = completedTasks.filter((t) => t.actualMinutes && t.actualMinutes > 0);
  
  const averageCompletionTime = tasksWithTime.length > 0
    ? tasksWithTime.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) / tasksWithTime.length
    : null;

  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    totalPoints: stopwatchState.totalPoints,
    currentStreak: streakState.currentStreak,
    longestStreak: streakState.longestStreak,
    averageCompletionTime,
  };
}
