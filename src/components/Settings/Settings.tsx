import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useStopwatchStore } from '../../stores/timerStore';
import { useTaskStore } from '../../stores/taskStore';
import { useStreakStore } from '../../stores/streakStore';
import { setSoundEnabled, playSound } from '../../utils/sound';
import { downloadBackup } from '../../utils/export';
import { Analytics } from '../Analytics/Analytics';
import styles from './Settings.module.css';

export function Settings(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const setStoreSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);

  // Sync sound utility with store
  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleSoundToggle = (): void => {
    const newValue = !soundEnabled;
    setStoreSoundEnabled(newValue);
    if (newValue) {
      playSound('click');
    }
  };

  const handleResetAllData = async (): Promise<void> => {
    // Clear all stores
    useTaskStore.setState({ tasks: [], recurringTasks: [] });
    useStreakStore.setState({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: undefined,
      totalTasksCompleted: 0,
      badges: useStreakStore.getState().badges.map(b => ({ ...b, unlockedAt: undefined })),
    });
    useStopwatchStore.setState({
      status: 'idle',
      activeTaskId: null,
      elapsedSeconds: 0,
      startedAt: null,
      totalPoints: 0,
      dailyPoints: 0,
      tasksUnderEstimate: 0,
    });
    
    // Clear persisted data
    await window.electronAPI.store.delete('tasks');
    await window.electronAPI.store.delete('recurringTasks');
    await window.electronAPI.store.delete('streakData');
    await window.electronAPI.store.delete('stopwatchData');
    
    setShowResetConfirm(false);
    setIsOpen(false);
    playSound('click');
  };

  return (
    <div className={styles.settings}>
      <button
        className={styles.settings__trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
        title="Settings"
      >
        ⚙️
      </button>

      {isOpen && (
        <>
          <div 
            className={styles.settings__overlay}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.settings__panel}>
            <div className={styles.settings__header}>
              <h2 className={styles.settings__title}>SETTINGS</h2>
              <button
                className={styles.settings__close}
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.settings__content}>
              {/* Sound Toggle */}
              <div className={styles.settings__option}>
                <span className={styles.settings__label}>Sound Effects</span>
                <button
                  className={`${styles.settings__toggle} ${soundEnabled ? styles['settings__toggle--on'] : ''}`}
                  onClick={handleSoundToggle}
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Analytics */}
              <div className={styles.settings__option}>
                <span className={styles.settings__label}>Productivity Stats</span>
                <button
                  className={styles.settings__analyticsBtn}
                  onClick={() => {
                    setShowAnalytics(true);
                    playSound('click');
                  }}
                >
                  📊 VIEW
                </button>
              </div>

              {/* Export Data */}
              <div className={styles.settings__option}>
                <span className={styles.settings__label}>Backup Data</span>
                <button
                  className={styles.settings__exportBtn}
                  onClick={() => {
                    downloadBackup();
                    playSound('click');
                  }}
                >
                  EXPORT
                </button>
              </div>

              {/* Reset Data */}
              <div className={styles.settings__option}>
                <span className={styles.settings__label}>Reset All Data</span>
                {!showResetConfirm ? (
                  <button
                    className={styles.settings__resetBtn}
                    onClick={() => setShowResetConfirm(true)}
                  >
                    RESET
                  </button>
                ) : (
                  <div className={styles.settings__resetConfirm}>
                    <span className={styles.settings__resetWarning}>Are you sure?</span>
                    <div className={styles.settings__resetActions}>
                      <button
                        className={styles.settings__resetConfirmBtn}
                        onClick={handleResetAllData}
                      >
                        YES
                      </button>
                      <button
                        className={styles.settings__resetCancelBtn}
                        onClick={() => setShowResetConfirm(false)}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* App Info */}
              <div className={styles.settings__info}>
                <p>Major Order v2.0.0</p>
                <p className={styles.settings__tagline}>Track time. Earn points. Complete orders.</p>
              </div>
            </div>
          </div>
        </>
      )}
      {showAnalytics && (
        <Analytics onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}
