import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTimerStore } from '../../stores/timerStore';
import { setSoundEnabled, playSound } from '../../utils/sound';
import styles from './Settings.module.css';

export function Settings(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const workMinutes = useSettingsStore((state) => state.workMinutes);
  const setStoreSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const setStoreWorkMinutes = useSettingsStore((state) => state.setWorkMinutes);
  
  const setTimerWorkDuration = useTimerStore((state) => state.setWorkDuration);

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

  const handleWorkMinutesChange = (minutes: number): void => {
    setStoreWorkMinutes(minutes);
    setTimerWorkDuration(minutes);
    playSound('click');
  };

  const workDurationOptions = [15, 20, 25, 30, 45, 60];

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

              {/* Work Duration */}
              <div className={styles.settings__option}>
                <span className={styles.settings__label}>Work Duration</span>
                <div className={styles.settings__durationBtns}>
                  {workDurationOptions.map((mins) => (
                    <button
                      key={mins}
                      className={`${styles.settings__durationBtn} ${workMinutes === mins ? styles['settings__durationBtn--active'] : ''}`}
                      onClick={() => handleWorkMinutesChange(mins)}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* App Info */}
              <div className={styles.settings__info}>
                <p>Major Order v1.0.0</p>
                <p className={styles.settings__tagline}>No excuses. Complete your orders.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
