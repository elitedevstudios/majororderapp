import { useState, useEffect } from 'react';
import { Settings } from '../Settings/Settings';
import styles from './Header.module.css';

export function Header(): JSX.Element {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  useEffect(() => {
    const checkAlwaysOnTop = async (): Promise<void> => {
      const value = await window.electronAPI?.getAlwaysOnTop();
      setIsAlwaysOnTop(value ?? false);
    };
    checkAlwaysOnTop();
  }, []);

  const handleToggleAlwaysOnTop = (): void => {
    window.electronAPI?.toggleAlwaysOnTop();
    setIsAlwaysOnTop(!isAlwaysOnTop);
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.header__title}>MAJOR ORDER</h1>
      
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
