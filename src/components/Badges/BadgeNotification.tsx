import { useEffect } from 'react';
import type { Badge } from '../../types';
import styles from './BadgeNotification.module.css';

interface BadgeNotificationProps {
  badge: Badge;
  onDismiss: () => void;
}

export function BadgeNotification({ badge, onDismiss }: BadgeNotificationProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={styles.notification} onClick={onDismiss}>
      <div className={styles.notification__content}>
        <span className={styles.notification__label}>BADGE UNLOCKED!</span>
        <span className={styles.notification__icon}>{badge.icon}</span>
        <span className={styles.notification__name}>{badge.name}</span>
        <span className={styles.notification__description}>{badge.description}</span>
      </div>
    </div>
  );
}
