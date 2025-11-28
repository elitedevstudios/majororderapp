import { useState, type RefObject } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import type { Priority } from '../../types';
import styles from './AddTask.module.css';

interface AddTaskProps {
  inputRef?: RefObject<HTMLInputElement>;
}

export function AddTask({ inputRef }: AddTaskProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(
      title.trim(),
      priority,
      estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined
    );

    // Reset form
    setTitle('');
    setPriority('medium');
    setEstimatedMinutes('');
    setIsExpanded(false);
  };

  return (
    <form className={styles['add-task']} onSubmit={handleSubmit}>
      <div className={styles['add-task__main']}>
        <input
          ref={inputRef}
          type="text"
          className={styles['add-task__input']}
          placeholder="+ Add new order..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />
        
        {title && (
          <button type="submit" className={styles['add-task__submit']}>
            ADD
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles['add-task__options']}>
          <div className={styles['add-task__option']}>
            <label className={styles['add-task__label']}>Priority:</label>
            <div className={styles['add-task__priority-buttons']}>
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles['add-task__priority-btn']} ${priority === p ? styles['add-task__priority-btn--active'] : ''} ${styles[`add-task__priority-btn--${p}`]}`}
                  onClick={() => setPriority(p)}
                >
                  {p.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className={styles['add-task__option']}>
            <label className={styles['add-task__label']}>Est. time:</label>
            <input
              type="number"
              className={styles['add-task__time-input']}
              placeholder="min"
              min="1"
              max="480"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
            />
          </div>
        </div>
      )}
    </form>
  );
}
