import { useTaskStore } from '../../stores/taskStore';
import { useTimerStore } from '../../stores/timerStore';
import { useStreakStore } from '../../stores/streakStore';
import styles from './DailyReview.module.css';

interface DailyReviewProps {
  onDismiss: () => void;
}

export function DailyReview({ onDismiss }: DailyReviewProps): JSX.Element {
  const getCompletedToday = useTaskStore((state) => state.getCompletedToday);
  const dailyPomodoros = useTimerStore((state) => state.dailyPomodorosCompleted);
  const currentStreak = useStreakStore((state) => state.currentStreak);
  
  const completedToday = getCompletedToday();
  
  // Calculate time accuracy
  const tasksWithEstimates = completedToday.filter(
    (t) => t.estimatedMinutes && t.actualMinutes
  );
  
  let accuracyMessage = '';
  let accuracyClass = '';
  
  if (tasksWithEstimates.length > 0) {
    const totalEstimated = tasksWithEstimates.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const totalActual = tasksWithEstimates.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
    const diff = totalEstimated - totalActual;
    
    if (diff > 0) {
      accuracyMessage = `${diff} min faster than estimated`;
      accuracyClass = styles['review__stat--positive'];
    } else if (diff < 0) {
      accuracyMessage = `${Math.abs(diff)} min over estimated`;
      accuracyClass = styles['review__stat--negative'];
    } else {
      accuracyMessage = 'Right on schedule';
      accuracyClass = styles['review__stat--neutral'];
    }
  }

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.review} onClick={(e) => e.stopPropagation()}>
        <div className={styles.review__header}>
          <span className={styles.review__icon}>🎖️</span>
          <h2 className={styles.review__title}>MISSION COMPLETE</h2>
        </div>

        <div className={styles.review__stats}>
          <div className={styles.review__stat}>
            <span className={styles['review__stat-value']}>{completedToday.length}</span>
            <span className={styles['review__stat-label']}>Tasks Done</span>
          </div>
          
          <div className={styles.review__stat}>
            <span className={styles['review__stat-value']}>🍅 {dailyPomodoros}</span>
            <span className={styles['review__stat-label']}>Pomodoros</span>
          </div>
          
          <div className={styles.review__stat}>
            <span className={styles['review__stat-value']}>🔥 {currentStreak}</span>
            <span className={styles['review__stat-label']}>Day Streak</span>
          </div>
        </div>

        {accuracyMessage && (
          <div className={`${styles.review__accuracy} ${accuracyClass}`}>
            {accuracyMessage}
          </div>
        )}

        <div className={styles.review__tasks}>
          <span className={styles.review__tasksLabel}>Completed Orders:</span>
          <ul className={styles.review__tasksList}>
            {completedToday.map((task) => (
              <li key={task.id} className={styles.review__taskItem}>
                ✓ {task.title}
              </li>
            ))}
          </ul>
        </div>

        <button className={styles.review__btn} onClick={onDismiss}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
