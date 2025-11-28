import { useEffect } from 'react';
import { useStreakStore } from '../../stores/streakStore';
import styles from './StreakDisplay.module.css';

export function StreakDisplay(): JSX.Element {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const totalTasksCompleted = useStreakStore((state) => state.totalTasksCompleted);
  const badges = useStreakStore((state) => state.badges);
  const getStreakStatus = useStreakStore((state) => state.getStreakStatus);
  
  const status = getStreakStatus();

  // Update tray with current streak
  useEffect(() => {
    window.electronAPI?.updateStreak(currentStreak);
  }, [currentStreak]);

  const unlockedBadges = badges.filter((b) => b.unlockedAt);

  // Determine display state
  const isStreakActive = status.isActive || currentStreak > 0;
  const showPending = status.isPending;

  return (
    <div className={styles.streak}>
      <div className={styles.streak__main}>
        <div className={styles.streak__fire}>
          <span className={`${styles.streak__icon} ${isStreakActive ? styles['streak__icon--active'] : ''} ${showPending ? styles['streak__icon--pending'] : ''}`}>
            🔥
          </span>
          <div className={styles.streak__numbers}>
            {showPending ? (
              <>
                <span className={styles.streak__count}>{currentStreak}</span>
                <span className={styles.streak__arrow}>→</span>
                <span className={styles['streak__count--pending']}>{status.potentialStreak}</span>
              </>
            ) : (
              <span className={styles.streak__count}>{currentStreak}</span>
            )}
          </div>
          <span className={styles.streak__label}>
            {showPending ? 'COMPLETE TODAY' : 'DAY STREAK'}
          </span>
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
