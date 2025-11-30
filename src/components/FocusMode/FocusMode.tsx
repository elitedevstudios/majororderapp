import { useEffect } from 'react';
import { useStopwatchStore } from '../../stores/timerStore';
import { useTaskStore } from '../../stores/taskStore';
import styles from './FocusMode.module.css';

interface FocusModeProps {
  onExit: () => void;
}

export function FocusMode({ onExit }: FocusModeProps): JSX.Element {
  const status = useStopwatchStore((state) => state.status);
  const activeTaskId = useStopwatchStore((state) => state.activeTaskId);
  const elapsedSeconds = useStopwatchStore((state) => state.elapsedSeconds);
  const tick = useStopwatchStore((state) => state.tick);
  const totalPoints = useStopwatchStore((state) => state.totalPoints);

  const tasks = useTaskStore((state) => state.tasks);
  const getIncompleteTasks = useTaskStore((state) => state.getIncompleteTasks);
  
  const currentTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const incompleteTasks = getIncompleteTasks();

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tick the stopwatch
  useEffect(() => {
    if (status !== 'running') return;
    
    const interval = setInterval(() => {
      tick();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status, tick]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'f')) {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  return (
    <div className={styles.focus}>
      <button className={styles.focus__exit} onClick={onExit} title="Exit Focus Mode (Esc)">
        ✕
      </button>

      <div className={styles.focus__content}>
        <span className={styles.focus__mode}>
          {status === 'running' ? 'TRACKING TIME' : 'FOCUS MODE'}
        </span>
        
        <div className={styles.focus__timer}>
          <span className={styles.focus__time}>
            {status === 'running' ? formatTime(elapsedSeconds) : '--:--'}
          </span>
        </div>

        {currentTask ? (
          <div className={styles.focus__task}>
            <span className={styles.focus__taskLabel}>CURRENT MISSION</span>
            <span className={styles.focus__taskTitle}>{currentTask.title}</span>
            {currentTask.estimatedMinutes && (
              <span className={styles.focus__estimate}>
                Est: {currentTask.estimatedMinutes}m
              </span>
            )}
          </div>
        ) : (
          <div className={styles.focus__task}>
            <span className={styles.focus__taskLabel}>NO ACTIVE TASK</span>
            <span className={styles.focus__taskTitle}>
              {incompleteTasks.length > 0 
                ? 'Click ▶ on a task to start tracking'
                : 'Add a task to begin'}
            </span>
          </div>
        )}

        <div className={styles.focus__stats}>
          <span className={styles.focus__points}>⭐ {totalPoints} points</span>
        </div>

        <p className={styles.focus__hint}>
          Esc to exit focus mode
        </p>
      </div>
    </div>
  );
}
