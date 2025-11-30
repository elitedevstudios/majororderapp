import { useEffect } from 'react';
import { useTimerStore } from '../../stores/timerStore';
import { useTaskStore } from '../../stores/taskStore';
import { playSound } from '../../utils/sound';
import styles from './FocusMode.module.css';

interface FocusModeProps {
  onExit: () => void;
}

export function FocusMode({ onExit }: FocusModeProps): JSX.Element {
  const {
    mode,
    status,
    timeRemaining,
    currentTaskId,
    config,
    startTimer,
    pauseTimer,
  } = useTimerStore();

  const tasks = useTaskStore((state) => state.tasks);
  const currentTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null;

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exit on break mode
  useEffect(() => {
    if (mode !== 'work' && status === 'idle') {
      onExit();
    }
  }, [mode, status, onExit]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'f')) {
        e.preventDefault();
        onExit();
      }
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (status === 'running') {
          pauseTimer();
        } else {
          playSound('timerStart');
          startTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, startTimer, pauseTimer, onExit]);

  const getModeLabel = (): string => {
    switch (mode) {
      case 'work':
        return 'FOCUS TIME';
      case 'shortBreak':
        return 'SHORT BREAK';
      case 'longBreak':
        return 'LONG BREAK';
    }
  };

  const progress = ((config.workMinutes * 60 - timeRemaining) / (config.workMinutes * 60)) * 100;

  return (
    <div className={styles.focus}>
      <button className={styles.focus__exit} onClick={onExit} title="Exit Focus Mode (Esc)">
        ✕
      </button>

      <div className={styles.focus__content}>
        <span className={styles.focus__mode}>{getModeLabel()}</span>
        
        <div className={styles.focus__timer}>
          <span className={`${styles.focus__time} ${status === 'running' && timeRemaining <= 60 ? styles['focus__time--urgent'] : ''}`}>
            {formatTime(timeRemaining)}
          </span>
          
          <div className={styles.focus__progress}>
            <div 
              className={styles['focus__progress-bar']}
              style={{ inlineSize: `${progress}%` }}
            />
          </div>
        </div>

        {currentTask && (
          <div className={styles.focus__task}>
            <span className={styles.focus__taskLabel}>CURRENT MISSION</span>
            <span className={styles.focus__taskTitle}>{currentTask.title}</span>
            {currentTask.pomodorosSpent > 0 && (
              <span className={styles.focus__pomodoros}>
                🍅 {currentTask.pomodorosSpent}
              </span>
            )}
          </div>
        )}

        <div className={styles.focus__controls}>
          {status === 'running' ? (
            <button
              className={styles['focus__btn--pause']}
              onClick={pauseTimer}
            >
              ⏸ PAUSE
            </button>
          ) : (
            <button
              className={styles['focus__btn--start']}
              onClick={() => {
                playSound('timerStart');
                startTimer();
              }}
            >
              ▶ {status === 'paused' ? 'RESUME' : 'START'}
            </button>
          )}
        </div>

        <p className={styles.focus__hint}>
          Press Space to {status === 'running' ? 'pause' : 'start'} • Esc to exit
        </p>
      </div>
    </div>
  );
}
