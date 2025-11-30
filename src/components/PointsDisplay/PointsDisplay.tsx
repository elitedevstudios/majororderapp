import { useStopwatchStore } from '../../stores/timerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import styles from './PointsDisplay.module.css';

export function PointsDisplay(): JSX.Element {
  const totalPoints = useStopwatchStore((state) => state.totalPoints);
  const dailyPoints = useStopwatchStore((state) => state.dailyPoints);
  const tasksUnderEstimate = useStopwatchStore((state) => state.tasksUnderEstimate);
  const dailyGoal = useSettingsStore((state) => state.dailyPointGoal);

  const dailyProgress = Math.min((dailyPoints / dailyGoal) * 100, 100);
  const goalReached = dailyPoints >= dailyGoal;

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
          <span className={`${styles['points-display__value']} ${goalReached ? styles['points-display__value--goal'] : ''}`}>
            {dailyPoints}
          </span>
          <span className={styles['points-display__stat-label']}>Today</span>
        </div>
        
        <div className={styles['points-display__divider']} />
        
        <div className={styles['points-display__stat']}>
          <span className={styles['points-display__value']}>{tasksUnderEstimate}</span>
          <span className={styles['points-display__stat-label']}>Speed Bonuses</span>
        </div>
      </div>

      {/* Daily goal progress bar */}
      <div className={styles['points-display__goal']}>
        <div className={styles['points-display__goal-header']}>
          <span>Daily Goal</span>
          <span>{dailyPoints}/{dailyGoal} pts</span>
        </div>
        <div className={styles['points-display__goal-bar']}>
          <div 
            className={`${styles['points-display__goal-fill']} ${goalReached ? styles['points-display__goal-fill--complete'] : ''}`}
            style={{ inlineSize: `${dailyProgress}%` }}
          />
        </div>
        {goalReached && (
          <span className={styles['points-display__goal-complete']}>🎯 Goal reached!</span>
        )}
      </div>
    </div>
  );
}
