import { useStopwatchStore } from '../../stores/timerStore';
import styles from './PointsDisplay.module.css';

export function PointsDisplay(): JSX.Element {
  const totalPoints = useStopwatchStore((state) => state.totalPoints);
  const dailyPoints = useStopwatchStore((state) => state.dailyPoints);
  const tasksUnderEstimate = useStopwatchStore((state) => state.tasksUnderEstimate);

  return (
    <div className={styles['points-display']}>
      <div className={styles['points-display__header']}>
        <span className={styles['points-display__label']}>MISSION SCORE</span>
      </div>
      
      <div className={styles['points-display__stats']}>
        <div className={styles['points-display__stat']}>
          <span className={styles['points-display__value']}>{totalPoints}</span>
          <span className={styles['points-display__stat-label']}>Total Points</span>
        </div>
        
        <div className={styles['points-display__divider']} />
        
        <div className={styles['points-display__stat']}>
          <span className={styles['points-display__value']}>{dailyPoints}</span>
          <span className={styles['points-display__stat-label']}>Today</span>
        </div>
        
        <div className={styles['points-display__divider']} />
        
        <div className={styles['points-display__stat']}>
          <span className={styles['points-display__value']}>{tasksUnderEstimate}</span>
          <span className={styles['points-display__stat-label']}>Speed Bonuses</span>
        </div>
      </div>

      <div className={styles['points-display__hint']}>
        Complete tasks under estimated time for bonus points!
      </div>
    </div>
  );
}
