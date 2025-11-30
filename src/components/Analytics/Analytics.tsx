import { useMemo } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useStopwatchStore } from '../../stores/timerStore';
import { useStreakStore } from '../../stores/streakStore';
import styles from './Analytics.module.css';

interface AnalyticsProps {
  onClose: () => void;
}

interface HourlyData {
  hour: number;
  count: number;
}

export function Analytics({ onClose }: AnalyticsProps): JSX.Element {
  const tasks = useTaskStore((state) => state.tasks);
  const totalPoints = useStopwatchStore((state) => state.totalPoints);
  const tasksUnderEstimate = useStopwatchStore((state) => state.tasksUnderEstimate);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const totalTasksCompleted = useStreakStore((state) => state.totalTasksCompleted);

  // Calculate analytics
  const analytics = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed && t.completedAt);
    
    // 1. Time-of-day productivity
    const hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        hourlyData[hour].count++;
      }
    });
    
    const peakHour = hourlyData.reduce((max, curr) => 
      curr.count > max.count ? curr : max, hourlyData[0]
    );
    
    const formatHour = (hour: number): string => {
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    };

    // 2. Task completion rate
    const totalCreated = tasks.length;
    const completionRate = totalCreated > 0 
      ? Math.round((completedTasks.length / totalCreated) * 100) 
      : 0;

    // 3. Time estimation accuracy
    const tasksWithEstimates = completedTasks.filter(
      (t) => t.estimatedMinutes && t.actualMinutes
    );
    
    let avgAccuracy = 0;
    let accuracyLabel = 'No data';
    
    if (tasksWithEstimates.length > 0) {
      const totalEstimated = tasksWithEstimates.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
      const totalActual = tasksWithEstimates.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
      
      if (totalEstimated > 0) {
        avgAccuracy = Math.round((totalActual / totalEstimated) * 100);
        
        if (avgAccuracy < 80) {
          accuracyLabel = 'Overestimating';
        } else if (avgAccuracy > 120) {
          accuracyLabel = 'Underestimating';
        } else {
          accuracyLabel = 'Accurate';
        }
      }
    }

    // Speed bonus rate
    const speedBonusRate = completedTasks.length > 0
      ? Math.round((tasksUnderEstimate / completedTasks.length) * 100)
      : 0;

    // Average points per task
    const avgPointsPerTask = completedTasks.length > 0
      ? Math.round(totalPoints / completedTasks.length)
      : 0;

    return {
      hourlyData,
      peakHour: peakHour.count > 0 ? formatHour(peakHour.hour) : 'Not enough data',
      peakHourCount: peakHour.count,
      completionRate,
      totalCreated,
      totalCompleted: completedTasks.length,
      avgAccuracy,
      accuracyLabel,
      tasksWithEstimates: tasksWithEstimates.length,
      speedBonusRate,
      avgPointsPerTask,
      longestStreak,
      totalTasksCompleted,
    };
  }, [tasks, totalPoints, tasksUnderEstimate, longestStreak, totalTasksCompleted]);

  // Find max for chart scaling
  const maxCount = Math.max(...analytics.hourlyData.map((h) => h.count), 1);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.analytics} onClick={(e) => e.stopPropagation()}>
        <div className={styles.analytics__header}>
          <h2 className={styles.analytics__title}>📊 PRODUCTIVITY ANALYTICS</h2>
          <button className={styles.analytics__close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.analytics__content}>
          {/* 1. Time of Day Productivity */}
          <section className={styles.analytics__section}>
            <h3 className={styles.analytics__sectionTitle}>⏰ Peak Productivity Time</h3>
            <div className={styles.analytics__chart}>
              {analytics.hourlyData.map((data) => (
                <div key={data.hour} className={styles.analytics__bar}>
                  <div 
                    className={styles.analytics__barFill}
                    style={{ blockSize: `${(data.count / maxCount) * 100}%` }}
                    title={`${data.hour}:00 - ${data.count} tasks`}
                  />
                </div>
              ))}
            </div>
            <div className={styles.analytics__chartLabels}>
              <span>12AM</span>
              <span>6AM</span>
              <span>12PM</span>
              <span>6PM</span>
              <span>12AM</span>
            </div>
            <p className={styles.analytics__insight}>
              🎯 Most productive at <strong>{analytics.peakHour}</strong>
              {analytics.peakHourCount > 0 && ` (${analytics.peakHourCount} tasks)`}
            </p>
          </section>

          {/* 2. Task Completion Rate */}
          <section className={styles.analytics__section}>
            <h3 className={styles.analytics__sectionTitle}>✅ Completion Rate</h3>
            <div className={styles.analytics__stat}>
              <span className={styles.analytics__statValue}>{analytics.completionRate}%</span>
              <span className={styles.analytics__statLabel}>
                {analytics.totalCompleted} of {analytics.totalCreated} tasks completed
              </span>
            </div>
            <div className={styles.analytics__progressBar}>
              <div 
                className={styles.analytics__progressFill}
                style={{ inlineSize: `${analytics.completionRate}%` }}
              />
            </div>
          </section>

          {/* 3. Time Estimation Accuracy */}
          <section className={styles.analytics__section}>
            <h3 className={styles.analytics__sectionTitle}>🎯 Estimation Accuracy</h3>
            {analytics.tasksWithEstimates > 0 ? (
              <>
                <div className={styles.analytics__stat}>
                  <span className={styles.analytics__statValue}>{analytics.avgAccuracy}%</span>
                  <span className={styles.analytics__statLabel}>
                    {analytics.accuracyLabel} • Based on {analytics.tasksWithEstimates} tasks
                  </span>
                </div>
                <p className={styles.analytics__insight}>
                  {analytics.avgAccuracy < 80 && '💡 Try setting shorter estimates'}
                  {analytics.avgAccuracy > 120 && '💡 Try adding buffer time to estimates'}
                  {analytics.avgAccuracy >= 80 && analytics.avgAccuracy <= 120 && '🌟 Great estimation skills!'}
                </p>
              </>
            ) : (
              <p className={styles.analytics__noData}>
                Add time estimates to tasks to see accuracy data
              </p>
            )}
          </section>

          {/* Summary Stats */}
          <section className={styles.analytics__summary}>
            <div className={styles.analytics__summaryItem}>
              <span className={styles.analytics__summaryValue}>{analytics.avgPointsPerTask}</span>
              <span className={styles.analytics__summaryLabel}>Avg pts/task</span>
            </div>
            <div className={styles.analytics__summaryItem}>
              <span className={styles.analytics__summaryValue}>{analytics.speedBonusRate}%</span>
              <span className={styles.analytics__summaryLabel}>Speed bonus rate</span>
            </div>
            <div className={styles.analytics__summaryItem}>
              <span className={styles.analytics__summaryValue}>{analytics.longestStreak}</span>
              <span className={styles.analytics__summaryLabel}>Best streak</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
