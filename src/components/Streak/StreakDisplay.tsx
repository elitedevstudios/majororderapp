import { useEffect } from 'react';
import { useStreakStore } from '../../stores/streakStore';
import styles from './StreakDisplay.module.css';

export function StreakDisplay(): JSX.Element {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const totalTasksCompleted = useStreakStore((state) => state.totalTasksCompleted);
  const badges = useStreakStore((state) => state.badges);

  // Update tray with current streak
  useEffect(() => {
    window.electronAPI?.updateStreak(currentStreak);
  }, [currentStreak]);

  const unlockedBadges = badges.filter((b) => b.unlockedAt);

  return (
    <div className={styles.streak}>
      <div className={styles.streak__main}>
        <div className={styles.streak__fire}>
          <span className={`${styles.streak__icon} ${currentStreak > 0 ? styles['streak__icon--active'] : ''}`}>
            🔥
          </span>
          <span className={styles.streak__count}>{currentStreak}</span>
          <span className={styles.streak__label}>DAY STREAK</span>
        </div>
        
        <div className={styles.streak__stats}>
          <div className={styles.streak__stat}>
            <span className={styles['streak__stat-value']}>{longestStreak}</span>
            <span className={styles['streak__stat-label']}>Best</span>
          </div>
          <div className={styles.streak__stat}>
            <span className={styles['streak__stat-value']}>{totalTasksCompleted}</span>
            <span className={styles['streak__stat-label']}>Tasks</span>
          </div>
        </div>
      </div>

      {unlockedBadges.length > 0 && (
        <div className={styles.streak__badges}>
          {unlockedBadges.map((badge) => (
            <span
              key={badge.id}
              className={styles.streak__badge}
              title={`${badge.name}: ${badge.description}`}
            >
              {badge.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
