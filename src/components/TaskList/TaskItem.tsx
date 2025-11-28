import type { Task } from '../../types';
import styles from './TaskList.module.css';

interface TaskItemProps {
  task: Task;
  index: number;
  isDragging: boolean;
  timeFeedback: string | null;
  onComplete: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function TaskItem({
  task,
  isDragging,
  timeFeedback,
  onComplete,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: TaskItemProps): JSX.Element {
  const getPriorityClass = (): string => {
    switch (task.priority) {
      case 'high':
        return styles['task-item--high'];
      case 'medium':
        return styles['task-item--medium'];
      case 'low':
        return styles['task-item--low'];
    }
  };

  const getPriorityIcon = (): string => {
    switch (task.priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
    }
  };

  return (
    <li
      className={`${styles['task-item']} ${getPriorityClass()} ${task.completed ? styles['task-item--completed'] : ''} ${isDragging ? styles['task-item--dragging'] : ''}`}
      draggable={!task.completed}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <button
        className={styles['task-item__checkbox']}
        onClick={onComplete}
        disabled={task.completed}
        aria-label={task.completed ? 'Task completed' : 'Mark as complete'}
      >
        {task.completed ? '✓' : '○'}
      </button>

      <div className={styles['task-item__content']}>
        <span className={styles['task-item__title']}>{task.title}</span>
        
        <div className={styles['task-item__meta']}>
          <span className={styles['task-item__priority']}>{getPriorityIcon()}</span>
          
          {task.estimatedMinutes && (
            <span className={styles['task-item__time']}>
              ~{task.estimatedMinutes}m
            </span>
          )}
          
          {task.pomodorosSpent > 0 && (
            <span className={styles['task-item__pomodoros']}>
              🍅 {task.pomodorosSpent}
            </span>
          )}
        </div>

        {timeFeedback && (
          <div className={styles['task-item__feedback']}>
            {timeFeedback}
          </div>
        )}
      </div>

      {!task.completed && (
        <button
          className={styles['task-item__delete']}
          onClick={onDelete}
          aria-label="Delete task"
        >
          ✕
        </button>
      )}

      {!task.completed && (
        <span className={styles['task-item__drag']} aria-hidden="true">
          ⋮⋮
        </span>
      )}
    </li>
  );
}
