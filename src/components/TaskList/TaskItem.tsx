import { useState, useRef, useEffect } from 'react';
import type { Task, Priority } from '../../types';
import styles from './TaskList.module.css';

function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

interface TaskItemProps {
  task: Task;
  isDragging: boolean;
  isActive: boolean;
  elapsedTime: string;
  timeFeedback: string | null;
  onComplete: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onStartStop: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function TaskItem({
  task,
  isDragging,
  isActive,
  elapsedTime,
  timeFeedback,
  onComplete,
  onDelete,
  onUpdate,
  onStartStop,
  onDragStart,
  onDragOver,
  onDragEnd,
}: TaskItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = (): void => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate({ title: trimmed });
    }
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
    }
  };

  const cyclePriority = (): void => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextPriority = priorities[(currentIndex + 1) % 3];
    onUpdate({ priority: nextPriority });
  };
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
      className={`${styles['task-item']} ${getPriorityClass()} ${task.completed ? styles['task-item--completed'] : ''} ${isDragging ? styles['task-item--dragging'] : ''} ${isActive ? styles['task-item--active'] : ''}`}
      draggable={!task.completed && !isActive}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {/* Start/Stop button for incomplete tasks */}
      {!task.completed && (
        <button
          className={`${styles['task-item__stopwatch']} ${isActive ? styles['task-item__stopwatch--active'] : ''}`}
          onClick={onStartStop}
          aria-label={isActive ? 'Stop tracking' : 'Start tracking'}
        >
          {isActive ? '⏹' : '▶'}
        </button>
      )}
      
      {/* Checkbox for completing */}
      <button
        className={styles['task-item__checkbox']}
        onClick={onComplete}
        disabled={task.completed}
        aria-label={task.completed ? 'Task completed' : 'Mark as complete'}
      >
        {task.completed ? '✓' : '○'}
      </button>

      <div className={styles['task-item__content']}>
        {isEditing && !task.completed ? (
          <input
            ref={inputRef}
            type="text"
            className={styles['task-item__edit-input']}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span 
            className={styles['task-item__title']}
            onDoubleClick={() => !task.completed && setIsEditing(true)}
            title={task.completed ? undefined : 'Double-click to edit'}
          >
            {task.title}
          </span>
        )}
        
        <div className={styles['task-item__meta']}>
          <button
            className={styles['task-item__priority']}
            onClick={cyclePriority}
            disabled={task.completed}
            title={task.completed ? undefined : 'Click to change priority'}
          >
            {getPriorityIcon()}
          </button>
          
          {task.estimatedMinutes && (
            <span className={styles['task-item__time']}>
              ~{task.estimatedMinutes}m
            </span>
          )}
          
          {/* Show elapsed time when active or if task has tracked time */}
          {(isActive || task.elapsedSeconds > 0) && (
            <span className={`${styles['task-item__elapsed']} ${isActive ? styles['task-item__elapsed--active'] : ''}`}>
              {isActive ? elapsedTime : formatElapsed(task.elapsedSeconds)}
            </span>
          )}
          
          {/* Show points earned for completed tasks */}
          {task.completed && task.pointsEarned > 0 && (
            <span className={styles['task-item__points']}>
              +{task.pointsEarned} pts
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
