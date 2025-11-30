import { useState, useEffect, useRef } from 'react';
import type { Task } from '../../types';
import styles from './CompletionModal.module.css';

interface CompletionModalProps {
  task: Task;
  onConfirm: (actualMinutes?: number) => void;
  onCancel: () => void;
}

export function CompletionModal({ task, onConfirm, onCancel }: CompletionModalProps): JSX.Element | null {
  // If task has no estimate or already has actual time, skip modal
  const needsTimeEntry = task.estimatedMinutes && !task.actualMinutes;
  
  const [actualMinutes, setActualMinutes] = useState<string>(
    task.actualMinutes?.toString() || task.estimatedMinutes?.toString() || ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!needsTimeEntry) {
      onConfirm(task.actualMinutes);
    } else {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [needsTimeEntry, onConfirm, task.actualMinutes]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const minutes = actualMinutes ? parseInt(actualMinutes, 10) : undefined;
    onConfirm(minutes);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!needsTimeEntry) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h3 className={styles.modal__title}>MISSION COMPLETE</h3>
        <p className={styles.modal__task}>{task.title}</p>
        
        <form onSubmit={handleSubmit} className={styles.modal__form}>
          <label className={styles.modal__label}>
            Actual time spent:
            <div className={styles.modal__inputGroup}>
              <input
                ref={inputRef}
                type="number"
                min="1"
                max="480"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(e.target.value)}
                className={styles.modal__input}
                placeholder={task.estimatedMinutes?.toString()}
              />
              <span className={styles.modal__unit}>min</span>
            </div>
          </label>
          
          <p className={styles.modal__estimate}>
            Estimated: {task.estimatedMinutes} min
          </p>

          <div className={styles.modal__actions}>
            <button type="submit" className={styles['modal__btn--primary']}>
              COMPLETE
            </button>
            <button type="button" onClick={onCancel} className={styles['modal__btn--secondary']}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
