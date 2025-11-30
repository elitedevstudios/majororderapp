import { useTaskStore } from '../../stores/taskStore';
import type { Priority, DayStats } from '../../types';
import styles from './WeeklyChart.module.css';

const TOTAL_SEGMENTS = 10;

interface SegmentInfo {
  priority: Priority;
}

export function WeeklyChart(): JSX.Element {
  // Subscribe to tasks directly so component re-renders on changes
  const tasks = useTaskStore((state) => state.tasks);
  const getWeeklyStats = useTaskStore((state) => state.getWeeklyStats);
  
  // Recalculate stats whenever tasks change (tasks subscription triggers re-render)
  const stats = getWeeklyStats();
  
  const today = new Date().toISOString().split('T')[0];
  const totalWeek = stats.reduce((sum, s) => sum + s.count, 0);
  
  // Keep tasks reference to ensure reactivity
  void tasks.length;

  // Build segment list for a day by priority
  const buildSegments = (day: DayStats): SegmentInfo[] => {
    const segments: SegmentInfo[] = [];
    const priorities: Priority[] = ['low', 'medium', 'high'];
    
    // Combine regular and recurring counts
    priorities.forEach((priority) => {
      const count = day.regular[priority] + day.recurring[priority];
      for (let i = 0; i < count; i++) {
        segments.push({ priority });
      }
    });
    
    return segments;
  };

  return (
    <div className={styles.chart}>
      <div className={styles.chart__header}>
        <h3 className={styles.chart__title}>WEEKLY INTEL</h3>
        <span className={styles.chart__total}>{totalWeek} this week</span>
      </div>
      
      <div className={styles.chart__bars}>
        {stats.map((day) => {
          const segments = buildSegments(day);
          const isToday = day.date === today;
          
          return (
            <div key={day.date} className={styles.chart__column}>
              <div className={styles.chart__barContainer}>
                {/* Render LED segments from bottom to top */}
                {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
                  const segmentIndex = TOTAL_SEGMENTS - 1 - index;
                  const segment = segments[segmentIndex];
                  const isActive = segmentIndex < segments.length;
                  
                  // Build class names
                  const classNames = [styles.chart__segment];
                  if (isActive && segment) {
                    classNames.push(styles['chart__segment--active']);
                    classNames.push(styles[`chart__segment--${segment.priority}`]);
                    if (isToday) {
                      classNames.push(styles['chart__segment--today']);
                    }
                  }
                  
                  return (
                    <div
                      key={segmentIndex}
                      className={classNames.join(' ')}
                    />
                  );
                })}
              </div>
              <span className={styles.chart__value}>{day.count}</span>
              <span className={`${styles.chart__day} ${isToday ? styles['chart__day--today'] : ''}`}>
                {day.dayName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.chart__legend}>
        <div className={styles.chart__legendItem}>
          <span className={`${styles.chart__legendDot} ${styles['chart__legendDot--high']}`} />
          <span>High</span>
        </div>
        <div className={styles.chart__legendItem}>
          <span className={`${styles.chart__legendDot} ${styles['chart__legendDot--medium']}`} />
          <span>Med</span>
        </div>
        <div className={styles.chart__legendItem}>
          <span className={`${styles.chart__legendDot} ${styles['chart__legendDot--low']}`} />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}
