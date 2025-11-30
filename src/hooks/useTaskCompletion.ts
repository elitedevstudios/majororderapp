import { useCallback } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useStreakStore } from '../stores/streakStore';
import { useStopwatchStore } from '../stores/timerStore';
import { playSound } from '../utils/sound';
import type { Task, Badge } from '../types';

interface UseTaskCompletionOptions {
  onBadgeUnlock?: (badge: Badge) => void;
}

interface TaskCompletionResult {
  completeActiveTask: () => void;
  completeTaskById: (task: Task) => void;
}

/**
 * Centralized hook for task completion logic.
 * Handles stopwatch, points, badges, and streaks in one place.
 */
export function useTaskCompletion({ onBadgeUnlock }: UseTaskCompletionOptions = {}): TaskCompletionResult {
  // Task store
  const completeTask = useTaskStore((state) => state.completeTask);
  const areAllTasksComplete = useTaskStore((state) => state.areAllTasksComplete);
  const tasks = useTaskStore((state) => state.tasks);
  
  // Streak store
  const incrementTasksCompleted = useStreakStore((state) => state.incrementTasksCompleted);
  const checkAndUpdateStreak = useStreakStore((state) => state.checkAndUpdateStreak);
  const checkBadgeUnlock = useStreakStore((state) => state.checkBadgeUnlock);
  
  // Stopwatch store
  const activeTaskId = useStopwatchStore((state) => state.activeTaskId);
  const stopStopwatch = useStopwatchStore((state) => state.stopStopwatch);
  const calculatePoints = useStopwatchStore((state) => state.calculatePoints);
  const addPoints = useStopwatchStore((state) => state.addPoints);
  const tasksUnderEstimate = useStopwatchStore((state) => state.tasksUnderEstimate);
  const totalPoints = useStopwatchStore((state) => state.totalPoints);

  const processCompletion = useCallback((
    task: Task,
    elapsedSeconds: number
  ): void => {
    // Calculate points
    const points = calculatePoints(task.estimatedMinutes, elapsedSeconds, task.priority);
    const wasUnderEstimate = task.estimatedMinutes 
      ? elapsedSeconds < task.estimatedMinutes * 60 
      : false;

    // Complete the task
    const completedTask = completeTask(task.id, elapsedSeconds, points);
    if (!completedTask) return;

    // Add points
    addPoints(points, wasUnderEstimate);

    // Play sound and update streak
    playSound('taskComplete');
    incrementTasksCompleted();

    // Check for badge unlocks
    const totalCompleted = useStreakStore.getState().totalTasksCompleted;
    const currentStreak = useStreakStore.getState().currentStreak;

    const badgeContext = {
      tasksCompleted: totalCompleted,
      currentStreak,
      dailyPoints: totalPoints + points,
      tasksUnderEstimate: tasksUnderEstimate + (wasUnderEstimate ? 1 : 0),
      completedUnderEstimate: wasUnderEstimate,
    };

    const unlockedBadge = checkBadgeUnlock(badgeContext);
    if (unlockedBadge) {
      playSound('badgeUnlock');
      onBadgeUnlock?.(unlockedBadge);
    }

    // Check streak
    if (areAllTasksComplete()) {
      checkAndUpdateStreak(true);
    }
  }, [
    calculatePoints, 
    completeTask, 
    addPoints, 
    incrementTasksCompleted, 
    checkBadgeUnlock, 
    onBadgeUnlock, 
    areAllTasksComplete, 
    checkAndUpdateStreak,
    totalPoints,
    tasksUnderEstimate,
  ]);

  const completeActiveTask = useCallback((): void => {
    if (!activeTaskId) return;
    
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task) return;

    const { elapsedSeconds } = stopStopwatch();
    processCompletion(task, elapsedSeconds);
  }, [activeTaskId, tasks, stopStopwatch, processCompletion]);

  const completeTaskById = useCallback((task: Task): void => {
    let elapsedSeconds = task.elapsedSeconds;

    // If this task is currently being tracked, stop and get final time
    if (activeTaskId === task.id) {
      const result = stopStopwatch();
      elapsedSeconds = result.elapsedSeconds;
    }

    processCompletion(task, elapsedSeconds);
  }, [activeTaskId, stopStopwatch, processCompletion]);

  return {
    completeActiveTask,
    completeTaskById,
  };
}
