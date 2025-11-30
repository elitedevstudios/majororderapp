import { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { playSound } from '../../utils/sound';
import type { Priority } from '../../types';
import styles from './RecurringTasks.module.css';

const MAX_RECURRING_TASKS = 3;

export function RecurringTasks(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  const recurringTasks = useTaskStore((state) => state.recurringTasks);
  const addRecurringTask = useTaskStore((state) => state.addRecurringTask);
  const deleteRecurringTask = useTaskStore((state) => state.deleteRecurringTask);
  const toggleRecurringTask = useTaskStore((state) => state.toggleRecurringTask);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim()) return;

    addRecurringTask(
      title.trim(),
      priority,
      frequency,
      estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined
    );

    playSound('click');
    
    // Reset form
    setTitle('');
    setPriority('medium');
    setFrequency('daily');
    setEstimatedMinutes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string): void => {
    deleteRecurringTask(id);
    playSound('click');
  };

  const handleToggle = (id: string): void => {
    toggleRecurringTask(id);
    playSound('click');
  };

  const getPriorityIcon = (p: Priority): string => {
    switch (p) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  return (
    <div className={styles.recurring}>
      <button
        className={styles.recurring__header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.recurring__title}>
          🔄 STANDING ORDERS
        </span>
        <span className={styles.recurring__count}>
          {recurringTasks.length}/{MAX_RECURRING_TASKS}
        </span>
        <span className={styles.recurring__chevron}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className={styles.recurring__content}>
          {recurringTasks.length === 0 && !isAdding && (
            <p className={styles.recurring__empty}>
              No recurring tasks. Add up to 3 daily tasks.
            </p>
          )}

          <ul className={styles.recurring__list}>
            {recurringTasks.map((task) => (
              <li
                key={task.id}
                className={`${styles.recurring__item} ${!task.isActive ? styles['recurring__item--inactive'] : ''}`}
              >
                <button
                  className={styles.recurring__toggle}
                  onClick={() => handleToggle(task.id)}
                  title={task.isActive ? 'Pause' : 'Resume'}
                >
                  {task.isActive ? '✓' : '○'}
                </button>
                
                <div className={styles.recurring__info}>
                  <span className={styles.recurring__taskTitle}>{task.title}</span>
                  <span className={styles.recurring__meta}>
                    {getPriorityIcon(task.priority)} {task.frequency}
                  </span>
                </div>

                <button
                  className={styles.recurring__delete}
                  onClick={() => handleDelete(task.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {isAdding ? (
            <form className={styles.recurring__form} onSubmit={handleSubmit}>
              <input
                type="text"
                className={styles.recurring__input}
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              
              <div className={styles.recurring__options}>
                <div className={styles.recurring__option}>
                  <label>Priority:</label>
                  <div className={styles.recurring__priorityBtns}>
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.recurring__priorityBtn} ${priority === p ? styles['recurring__priorityBtn--active'] : ''}`}
                        onClick={() => setPriority(p)}
                      >
                        {p.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.recurring__option}>
                  <label>Frequency:</label>
                  <select
                    className={styles.recurring__select}
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

              </div>

              <div className={styles.recurring__actions}>
                <button type="submit" className={styles.recurring__saveBtn}>
                  SAVE
                </button>
                <button
                  type="button"
                  className={styles.recurring__cancelBtn}
                  onClick={() => setIsAdding(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          ) : (
            recurringTasks.length < MAX_RECURRING_TASKS && (
              <button
                className={styles.recurring__addBtn}
                onClick={() => setIsAdding(true)}
              >
                + Add Recurring Task ({MAX_RECURRING_TASKS - recurringTasks.length} left)
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
