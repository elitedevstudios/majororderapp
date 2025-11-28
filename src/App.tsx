import { useEffect, useState } from 'react';
import { useTaskStore } from './stores/taskStore';
import { useTimerStore } from './stores/timerStore';
import { useStreakStore } from './stores/streakStore';
import { Header } from './components/Header/Header';
import { Timer } from './components/Timer/Timer';
import { TaskList } from './components/TaskList/TaskList';
import { AddTask } from './components/AddTask/AddTask';
import { StreakDisplay } from './components/Streak/StreakDisplay';
import { BadgeNotification } from './components/Badges/BadgeNotification';
import type { Badge } from './types';
import styles from './App.module.css';

function App(): JSX.Element {
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const loadTasks = useTaskStore((state) => state.loadFromStorage);
  const loadTimer = useTimerStore((state) => state.loadConfig);
  const loadStreak = useStreakStore((state) => state.loadFromStorage);

  useEffect(() => {
    // Load all data from storage on mount
    const initializeApp = async (): Promise<void> => {
      await Promise.all([loadTasks(), loadTimer(), loadStreak()]);
    };
    initializeApp();
  }, [loadTasks, loadTimer, loadStreak]);

  const handleBadgeUnlock = (badge: Badge): void => {
    setUnlockedBadge(badge);
  };

  const handleBadgeDismiss = (): void => {
    setUnlockedBadge(null);
  };

  return (
    <div className={styles.app}>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.section}>
          <StreakDisplay />
        </section>

        <section className={styles.section}>
          <Timer onBadgeUnlock={handleBadgeUnlock} />
        </section>

        <section className={styles.section}>
          <AddTask />
        </section>

        <section className={styles['section--tasks']}>
          <TaskList onBadgeUnlock={handleBadgeUnlock} />
        </section>
      </main>

      {unlockedBadge && (
        <BadgeNotification badge={unlockedBadge} onDismiss={handleBadgeDismiss} />
      )}
    </div>
  );
}

export default App;
