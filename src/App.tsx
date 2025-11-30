import { useEffect, useState, useRef, useCallback } from 'react';
import { useTaskStore } from './stores/taskStore';
import { useStopwatchStore } from './stores/timerStore';
import { useStreakStore } from './stores/streakStore';
import { useSettingsStore } from './stores/settingsStore';
import { setSoundEnabled, playSound } from './utils/sound';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useTaskCompletion } from './hooks/useTaskCompletion';
import { Header } from './components/Header/Header';
import { PointsDisplay } from './components/PointsDisplay/PointsDisplay';
import { TaskList } from './components/TaskList/TaskList';
import { AddTask } from './components/AddTask/AddTask';
import { StreakDisplay } from './components/Streak/StreakDisplay';
import { WeeklyChart } from './components/WeeklyChart/WeeklyChart';
import { Analytics } from './components/Analytics/Analytics';
import { BadgeNotification } from './components/Badges/BadgeNotification';
import { FocusMode } from './components/FocusMode/FocusMode';
import { DailyReview } from './components/DailyReview/DailyReview';
import type { Badge } from './types';
import styles from './App.module.css';

function App(): JSX.Element {
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showDailyReview, setShowDailyReview] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [reviewDismissedToday, setReviewDismissedToday] = useState(false);
  const addTaskInputRef = useRef<HTMLInputElement>(null);
  const loadTasks = useTaskStore((state) => state.loadFromStorage);
  const areAllTasksComplete = useTaskStore((state) => state.areAllTasksComplete);
  const tasks = useTaskStore((state) => state.tasks);
  const loadStopwatchData = useStopwatchStore((state) => state.loadFromStorage);
  const loadStreak = useStreakStore((state) => state.loadFromStorage);
  const loadSettings = useSettingsStore((state) => state.loadFromStorage);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  useEffect(() => {
    // Load all data from storage on mount
    const initializeApp = async (): Promise<void> => {
      await Promise.all([loadTasks(), loadStopwatchData(), loadStreak(), loadSettings()]);
    };
    initializeApp();
  }, [loadTasks, loadStopwatchData, loadStreak, loadSettings]);

  // Sync sound setting
  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Show daily review when all tasks complete
  useEffect(() => {
    const hasTasks = tasks.length > 0;
    const allComplete = areAllTasksComplete();
    
    if (hasTasks && allComplete && !reviewDismissedToday) {
      setShowDailyReview(true);
    }
  }, [tasks, areAllTasksComplete, reviewDismissedToday]);

  // Focus new task input
  const focusNewTask = useCallback(() => {
    addTaskInputRef.current?.focus();
  }, []);

  // Toggle focus mode
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  const handleBadgeUnlock = useCallback((badge: Badge): void => {
    setUnlockedBadge(badge);
  }, []);

  const handleBadgeDismiss = (): void => {
    setUnlockedBadge(null);
  };

  // Undo/Redo
  const { undo, canUndo, undoMessage } = useUndoRedo();

  // Task completion via keyboard
  const { completeActiveTask } = useTaskCompletion({ onBadgeUnlock: handleBadgeUnlock });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: focusNewTask,
    onToggleFocus: toggleFocusMode,
    onCompleteActiveTask: completeActiveTask,
    onUndo: undo,
  });

  return (
    <div className={styles.app}>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.section}>
          <StreakDisplay />
        </section>

        <section className={styles.section}>
          <PointsDisplay />
        </section>

        <section className={styles.section}>
          <AddTask inputRef={addTaskInputRef} />
        </section>

        <section className={styles['section--tasks']}>
          <TaskList onBadgeUnlock={handleBadgeUnlock} />
        </section>

        <section className={styles.section}>
          <WeeklyChart />
        </section>

        {/* Analytics Button */}
        <button 
          className={styles.analyticsBtn}
          onClick={() => setShowAnalytics(true)}
        >
          📊 View Analytics
        </button>

        {/* Undo Toast */}
        {canUndo && (
          <div className={styles.undoToast}>
            <span>{undoMessage}</span>
            <button onClick={() => { undo(); playSound('click'); }}>UNDO</button>
          </div>
        )}

        {/* Standing Orders feature archived for simplicity
        <section className={styles.section}>
          <RecurringTasks />
        </section>
        */}
      </main>

      {unlockedBadge && (
        <BadgeNotification badge={unlockedBadge} onDismiss={handleBadgeDismiss} />
      )}

      {isFocusMode && (
        <FocusMode 
          onExit={() => setIsFocusMode(false)} 
          onBadgeUnlock={handleBadgeUnlock}
        />
      )}

      {showDailyReview && (
        <DailyReview
          onDismiss={() => {
            setShowDailyReview(false);
            setReviewDismissedToday(true);
          }}
        />
      )}

      {showAnalytics && (
        <Analytics onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}

export default App;
