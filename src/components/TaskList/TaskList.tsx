import { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useStreakStore } from '../../stores/streakStore';
import { playSound } from '../../utils/sound';
import { TaskItem } from './TaskItem';
import type { Badge, Task } from '../../types';
import styles from './TaskList.module.css';

interface TaskListProps {
  onBadgeUnlock: (badge: Badge) => void;
}

const MAX_VISIBLE_TASKS = 3;

export function TaskList({ onBadgeUnlock }: TaskListProps): JSX.Element {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const tasks = useTaskStore((state) => state.tasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const areAllTasksComplete = useTaskStore((state) => state.areAllTasksComplete);
  
  const incrementTasksCompleted = useStreakStore((state) => state.incrementTasksCompleted);
  const checkAndUpdateStreak = useStreakStore((state) => state.checkAndUpdateStreak);
  const checkBadgeUnlock = useStreakStore((state) => state.checkBadgeUnlock);

  const sortedTasks = [...tasks].sort((a, b) => {
    // Incomplete tasks first, then by order
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.order - b.order;
  });

  const handleComplete = (task: Task): void => {
    const completedTask = completeTask(task.id);
    if (!completedTask) return;

    playSound('taskComplete');
    incrementTasksCompleted();

    // Check for badges
    const totalCompleted = useStreakStore.getState().totalTasksCompleted;
    
    // First Blood badge
    if (totalCompleted === 1) {
      const badge = checkBadgeUnlock({ tasksCompleted: 1 });
      if (badge) onBadgeUnlock(badge);
    }

    // Centurion badge
    if (totalCompleted === 100) {
      const badge = checkBadgeUnlock({ tasksCompleted: 100 });
      if (badge) onBadgeUnlock(badge);
    }

    // Sniper badge - completed under estimate
    if (completedTask.estimatedMinutes && completedTask.actualMinutes) {
      if (completedTask.actualMinutes < completedTask.estimatedMinutes) {
        const badge = checkBadgeUnlock({ completedUnderEstimate: true });
        if (badge) onBadgeUnlock(badge);
      }
    }

    // Check if all tasks complete for streak
    if (areAllTasksComplete()) {
      checkAndUpdateStreak(true);
      
      // Check streak badges
      const currentStreak = useStreakStore.getState().currentStreak;
      if (currentStreak === 3 || currentStreak === 7 || currentStreak === 30) {
        const badge = checkBadgeUnlock({ currentStreak });
        if (badge) onBadgeUnlock(badge);
      }
    }
  };

  const handleDelete = (taskId: string): void => {
    deleteTask(taskId);
  };

  const handleDragStart = (index: number): void => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    reorderTasks(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = (): void => {
    setDraggedIndex(null);
  };

  const getTimeFeedback = (task: Task): string | null => {
    if (!task.completed || !task.estimatedMinutes || !task.actualMinutes) {
      return null;
    }

    const diff = task.estimatedMinutes - task.actualMinutes;
    
    if (diff > 0) {
      return `⚡ SNIPER! ${diff} min faster!`;
    } else if (diff < 0) {
      return `⏰ ${Math.abs(diff)} min over estimate`;
    }
    return '✓ Right on schedule!';
  };

  if (tasks.length === 0) {
    return (
      <div className={styles['task-list--empty']}>
        <span className={styles['task-list__empty-icon']}>📋</span>
        <p className={styles['task-list__empty-text']}>No orders received.</p>
        <p className={styles['task-list__empty-hint']}>Add a task to begin your mission.</p>
      </div>
    );
  }

  // Separate incomplete and completed tasks
  const incompleteTasks = sortedTasks.filter((t) => !t.completed);
  const completedTasks = sortedTasks.filter((t) => t.completed);
  
  // Show top 3 incomplete, or all if expanded
  const visibleIncompleteTasks = showAll 
    ? incompleteTasks 
    : incompleteTasks.slice(0, MAX_VISIBLE_TASKS);
  
  const hiddenCount = incompleteTasks.length - MAX_VISIBLE_TASKS;
  const hasHiddenTasks = hiddenCount > 0 && !showAll;

  return (
    <div className={styles['task-list']}>
      <div className={styles['task-list__header']}>
        <h2 className={styles['task-list__title']}>MAJOR ORDERS</h2>
        <span className={styles['task-list__count']}>
          {incompleteTasks.length} active
        </span>
      </div>
      
      <ul className={styles['task-list__items']}>
        {visibleIncompleteTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            isDragging={draggedIndex === index}
            timeFeedback={getTimeFeedback(task)}
            onComplete={() => handleComplete(task)}
            onDelete={() => handleDelete(task.id)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </ul>

      {hasHiddenTasks && (
        <button 
          className={styles['task-list__expand']}
          onClick={() => setShowAll(true)}
        >
          + {hiddenCount} more order{hiddenCount > 1 ? 's' : ''}
        </button>
      )}

      {showAll && incompleteTasks.length > MAX_VISIBLE_TASKS && (
        <button 
          className={styles['task-list__expand']}
          onClick={() => setShowAll(false)}
        >
          Show top 3 only
        </button>
      )}

      {completedTasks.length > 0 && (
        <div className={styles['task-list__completed']}>
          <span className={styles['task-list__completed-label']}>
            ✓ {completedTasks.length} completed today
          </span>
        </div>
      )}
    </div>
  );
}
