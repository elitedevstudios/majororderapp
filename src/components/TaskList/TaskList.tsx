import { useState, useCallback } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useStreakStore } from '../../stores/streakStore';
import { playSound } from '../../utils/sound';
import { TaskItem } from './TaskItem';
import { CompletionModal } from './CompletionModal';
import type { Badge, Task } from '../../types';
import styles from './TaskList.module.css';

interface TaskListProps {
  onBadgeUnlock: (badge: Badge) => void;
}

const MAX_VISIBLE_TASKS = 3;

export function TaskList({ onBadgeUnlock }: TaskListProps): JSX.Element {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [pendingCompleteTask, setPendingCompleteTask] = useState<Task | null>(null);
  
  const tasks = useTaskStore((state) => state.tasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const areAllTasksComplete = useTaskStore((state) => state.areAllTasksComplete);
  const getCompletedToday = useTaskStore((state) => state.getCompletedToday);
  const getCompletedTasks = useTaskStore((state) => state.getCompletedTasks);
  
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

  const handleCompleteClick = (task: Task): void => {
    // If task has estimate but no actual time, show modal
    if (task.estimatedMinutes && !task.actualMinutes) {
      setPendingCompleteTask(task);
    } else {
      finalizeComplete(task);
    }
  };

  const finalizeComplete = useCallback((task: Task, actualMinutes?: number): void => {
    const completedTask = completeTask(task.id, actualMinutes);
    if (!completedTask) return;

    setPendingCompleteTask(null);
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

    // Sniper badge - completed under estimate (now works with manual time entry!)
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
  }, [completeTask, incrementTasksCompleted, checkBadgeUnlock, onBadgeUnlock, areAllTasksComplete, checkAndUpdateStreak]);

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
  const completedTodayTasks = getCompletedToday();
  
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
            isDragging={draggedIndex === index}
            timeFeedback={getTimeFeedback(task)}
            onComplete={() => handleCompleteClick(task)}
            onDelete={() => handleDelete(task.id)}
            onUpdate={(updates) => updateTask(task.id, updates)}
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

      {completedTodayTasks.length > 0 && (
        <div className={styles['task-list__completed']}>
          <button 
            className={styles['task-list__completed-toggle']}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <span className={styles['task-list__completed-label']}>
              {completedTodayTasks.length} completed today
            </span>
            <span className={styles['task-list__completed-chevron']}>
              {showCompleted ? '▼' : '▶'}
            </span>
          </button>
          
          {showCompleted && (
            <ul className={styles['task-list__completed-items']}>
              {getCompletedTasks().map((task) => (
                <li key={task.id} className={styles['task-list__completed-item']}>
                  <span className={styles['task-list__completed-check']}>✓</span>
                  <span className={styles['task-list__completed-title']}>{task.title}</span>
                  <span className={styles['task-list__completed-date']}>
                    {task.completedAt ? formatCompletedDate(task.completedAt) : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pendingCompleteTask && (
        <CompletionModal
          task={pendingCompleteTask}
          onConfirm={(actualMinutes) => finalizeComplete(pendingCompleteTask, actualMinutes)}
          onCancel={() => setPendingCompleteTask(null)}
        />
      )}
    </div>
  );
}

function formatCompletedDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dateStr === todayStr) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
