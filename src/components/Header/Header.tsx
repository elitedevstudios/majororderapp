import { useState, useEffect } from 'react';
import { Settings } from '../Settings/Settings';
import styles from './Header.module.css';

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function Header(): JSX.Element {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const checkAlwaysOnTop = async (): Promise<void> => {
      const value = await window.electronAPI?.getAlwaysOnTop();
      setIsAlwaysOnTop(value ?? false);
    };
    checkAlwaysOnTop();
  }, []);

  // Update date at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setCurrentDate(new Date());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [currentDate]);

  const handleToggleAlwaysOnTop = (): void => {
    window.electronAPI?.toggleAlwaysOnTop();
    setIsAlwaysOnTop(!isAlwaysOnTop);
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__left}>
        <h1 className={styles.header__title}>MAJOR ORDER</h1>
        <span className={styles.header__date}>{formatDate(currentDate)}</span>
      </div>
      
      <div className={styles.header__actions}>
        <button
          className={`${styles.header__pin} ${isAlwaysOnTop ? styles['header__pin--active'] : ''}`}
          onClick={handleToggleAlwaysOnTop}
          title={isAlwaysOnTop ? 'Unpin window' : 'Pin window on top'}
          aria-pressed={isAlwaysOnTop}
        >
          📌
        </button>
        <Settings />
      </div>
    </header>
  );
}
