import { useEffect, useRef } from 'react';
import { useTimerStore } from '../../stores/timerStore';
import { useTaskStore } from '../../stores/taskStore';
import { useStreakStore } from '../../stores/streakStore';
import { playSound } from '../../utils/sound';
import type { Badge } from '../../types';
import styles from './Timer.module.css';

interface TimerProps {
  onBadgeUnlock: (badge: Badge) => void;
}

export function Timer({ onBadgeUnlock }: TimerProps): JSX.Element {
  const intervalRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  
  const {
    mode,
    status,
    timeRemaining,
    currentTaskId,
    dailyPomodorosCompleted,
    config,
    startTimer,
    pauseTimer,
    stopTimer,
    skipToNext,
    tick,
    getProgress,
  } = useTimerStore();

  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const checkBadgeUnlock = useStreakStore((state) => state.checkBadgeUnlock);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer tick effect
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = window.setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, tick]);

  // Update tray with timer status
  useEffect(() => {
    const formattedTime = formatTime(timeRemaining);
    window.electronAPI?.updateTimer(formattedTime, status);
  }, [timeRemaining, status]);

  // Listen for tray toggle timer event
  useEffect(() => {
    const cleanup = window.electronAPI?.onTrayToggleTimer(() => {
      if (status === 'running') {
        pauseTimer();
      } else {
        playSound('timerStart');
        startTimer();
      }
    });
    return cleanup;
  }, [status, startTimer, pauseTimer]);

  // Handle timer completion - detect when timer reaches 0
  useEffect(() => {
    // Only trigger completion when time transitions from >0 to 0
    const wasRunning = prevTimeRef.current !== null && prevTimeRef.current > 0;
    const justCompleted = timeRemaining === 0 && wasRunning;
    
    prevTimeRef.current = timeRemaining;
    
    if (!justCompleted) return;
    
    // Play sound
    playSound(mode === 'work' ? 'workComplete' : 'breakComplete');
    
    if (mode === 'work' && currentTaskId) {
      // Update task pomodoro count
      const task = tasks.find((t) => t.id === currentTaskId);
      if (task) {
        updateTask(currentTaskId, {
          pomodorosSpent: task.pomodorosSpent + 1,
          actualMinutes: (task.actualMinutes || 0) + config.workMinutes,
        });
      }
    }

    // Check for Time Lord badge
    if (dailyPomodorosCompleted + 1 >= 10) {
      const badge = checkBadgeUnlock({ dailyPomodoros: dailyPomodorosCompleted + 1 });
      if (badge) onBadgeUnlock(badge);
    }

    // Auto-advance to next mode
    skipToNext();
  }, [timeRemaining, mode, currentTaskId, tasks, updateTask, config.workMinutes, dailyPomodorosCompleted, checkBadgeUnlock, onBadgeUnlock, skipToNext]);

  const handleStartTimer = (taskId?: string): void => {
    playSound('timerStart');
    startTimer(taskId);
  };

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

  const getModeIcon = (): string => {
    return mode === 'work' ? '🍅' : '☕';
  };

  return (
    <div className={styles.timer}>
      {/* Left: Icon + Mode + Time */}
      <div className={styles.timer__display}>
        <span className={styles.timer__icon}>{getModeIcon()}</span>
        <div className={styles.timer__mode}>
          <span className={styles.timer__label}>{getModeLabel()}</span>
          <span className={`${styles.timer__time} ${status === 'running' && timeRemaining <= 60 ? styles['timer__time--urgent'] : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Center: Progress bar */}
      <div className={styles.timer__progress}>
        <div 
          className={styles['timer__progress-bar']}
          style={{ inlineSize: `${getProgress()}%` }}
        />
      </div>

      {/* Right: Controls */}
      <div className={styles.timer__controls}>
        {status === 'idle' && (
          <button
            className={`${styles.timer__button} ${styles['timer__button--primary']}`}
            onClick={() => handleStartTimer()}
            title="Start timer (Space)"
          >
            ▶
          </button>
        )}
        
        {status === 'running' && (
          <button
            className={`${styles.timer__button} ${styles['timer__button--secondary']}`}
            onClick={pauseTimer}
            title="Pause timer (Space)"
          >
            ⏸
          </button>
        )}
        
        {status === 'paused' && (
          <>
            <button
              className={`${styles.timer__button} ${styles['timer__button--primary']}`}
              onClick={() => handleStartTimer()}
              title="Resume timer (Space)"
            >
              ▶
            </button>
            <button
              className={`${styles.timer__button} ${styles['timer__button--danger']}`}
              onClick={stopTimer}
              title="Stop timer"
            >
              ⏹
            </button>
          </>
        )}
        
        {status !== 'idle' && (
          <button
            className={styles.timer__button}
            onClick={skipToNext}
            title="Skip to next"
          >
            ⏭
          </button>
        )}
      </div>
    </div>
  );
}
