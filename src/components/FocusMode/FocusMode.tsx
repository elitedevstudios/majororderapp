import { useEffect } from 'react';
import { useStopwatchStore } from '../../stores/timerStore';
import { useTaskStore } from '../../stores/taskStore';
import { useStreakStore } from '../../stores/streakStore';
import { playSound } from '../../utils/sound';
import type { Badge } from '../../types';
import styles from './FocusMode.module.css';

interface FocusModeProps {
  onExit: () => void;
  onBadgeUnlock?: (badge: Badge) => void;
}

export function FocusMode({ onExit, onBadgeUnlock }: FocusModeProps): JSX.Element {
  const status = useStopwatchStore((state) => state.status);
  const activeTaskId = useStopwatchStore((state) => state.activeTaskId);
  const elapsedSeconds = useStopwatchStore((state) => state.elapsedSeconds);
  const tick = useStopwatchStore((state) => state.tick);
  const totalPoints = useStopwatchStore((state) => state.totalPoints);
  const stopStopwatch = useStopwatchStore((state) => state.stopStopwatch);
  const pauseStopwatch = useStopwatchStore((state) => state.pauseStopwatch);
  const resumeStopwatch = useStopwatchStore((state) => state.resumeStopwatch);
  const startStandaloneStopwatch = useStopwatchStore((state) => state.startStandaloneStopwatch);
  const calculatePoints = useStopwatchStore((state) => state.calculatePoints);
  const addPoints = useStopwatchStore((state) => state.addPoints);
  const tasksUnderEstimate = useStopwatchStore((state) => state.tasksUnderEstimate);

  const tasks = useTaskStore((state) => state.tasks);
  const getIncompleteTasks = useTaskStore((state) => state.getIncompleteTasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const areAllTasksComplete = useTaskStore((state) => state.areAllTasksComplete);
  
  const incrementTasksCompleted = useStreakStore((state) => state.incrementTasksCompleted);
  const checkAndUpdateStreak = useStreakStore((state) => state.checkAndUpdateStreak);
  const checkBadgeUnlock = useStreakStore((state) => state.checkBadgeUnlock);
  const totalTasksCompleted = useStreakStore((state) => state.totalTasksCompleted);
  const currentStreak = useStreakStore((state) => state.currentStreak);
  
  const currentTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const incompleteTasks = getIncompleteTasks();

  // Handle completing the current task
  const handleCompleteTask = (): void => {
    if (!currentTask || !activeTaskId) return;
    
    // Stop the stopwatch and get elapsed time
    const { elapsedSeconds: finalElapsed } = stopStopwatch();
    
    // Calculate points
    const points = calculatePoints(currentTask.estimatedMinutes, finalElapsed, currentTask.priority);
    const completedUnderEstimate = currentTask.estimatedMinutes 
      ? (finalElapsed / 60) < currentTask.estimatedMinutes 
      : false;
    
    // Add points to store
    addPoints(points, completedUnderEstimate);
    
    // Complete the task
    completeTask(activeTaskId, finalElapsed, points);
    incrementTasksCompleted();
    
    // Play sound
    playSound('taskComplete');
    
    // Check for badge unlocks
    const badgeContext = {
      tasksCompleted: totalTasksCompleted + 1,
      currentStreak,
      dailyPoints: totalPoints + points,
      tasksUnderEstimate: tasksUnderEstimate + (completedUnderEstimate ? 1 : 0),
      completedUnderEstimate,
    };
    
    const unlockedBadge = checkBadgeUnlock(badgeContext);
    if (unlockedBadge) {
      playSound('badgeUnlock');
      onBadgeUnlock?.(unlockedBadge);
    }
    
    // Check streak
    checkAndUpdateStreak(areAllTasksComplete());
  };

  // Handle standalone stopwatch controls
  const handleStartStopwatch = (): void => {
    startStandaloneStopwatch();
  };

  const handlePauseStopwatch = (): void => {
    pauseStopwatch();
  };

  const handleResumeStopwatch = (): void => {
    resumeStopwatch();
  };

  const handleStopStopwatch = (): void => {
    stopStopwatch();
  };

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
          {status === 'running' ? 'TRACKING TIME' : status === 'paused' ? 'PAUSED' : 'FOCUS MODE'}
        </span>
        
        <div className={styles.focus__timer}>
          <span className={styles.focus__time}>
            {status !== 'idle' ? formatTime(elapsedSeconds) : '00:00'}
          </span>
        </div>

        {/* Standalone stopwatch controls */}
        <div className={styles.focus__controls}>
          {status === 'idle' && (
            <button
              className={styles['focus__btn--start']}
              onClick={handleStartStopwatch}
              title="Start stopwatch"
            >
              ▶ START
            </button>
          )}
          {status === 'running' && (
            <>
              <button
                className={styles['focus__btn--pause']}
                onClick={handlePauseStopwatch}
                title="Pause stopwatch"
              >
                ⏸ PAUSE
              </button>
              <button
                className={styles['focus__btn--stop']}
                onClick={handleStopStopwatch}
                title="Stop stopwatch"
              >
                ⏹ STOP
              </button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button
                className={styles['focus__btn--start']}
                onClick={handleResumeStopwatch}
                title="Resume stopwatch"
              >
                ▶ RESUME
              </button>
              <button
                className={styles['focus__btn--stop']}
                onClick={handleStopStopwatch}
                title="Stop stopwatch"
              >
                ⏹ STOP
              </button>
            </>
          )}
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
            
            <button
              className={styles.focus__complete}
              onClick={handleCompleteTask}
              title="Complete task"
            >
              ✓ COMPLETE
            </button>
          </div>
        ) : status !== 'idle' ? (
          <div className={styles.focus__task}>
            <span className={styles.focus__taskLabel}>STANDALONE TIMER</span>
            <span className={styles.focus__taskTitle}>
              Focus session in progress
            </span>
          </div>
        ) : (
          <div className={styles.focus__task}>
            <span className={styles.focus__taskLabel}>NO ACTIVE TASK</span>
            <span className={styles.focus__taskTitle}>
              {incompleteTasks.length > 0 
                ? 'Start the timer or click ▶ on a task'
                : 'Start the timer to begin focusing'}
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
