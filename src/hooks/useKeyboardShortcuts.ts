import { useEffect, useCallback } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { playSound } from '../utils/sound';

interface KeyboardShortcutsOptions {
  onNewTask?: () => void;
  onCloseModal?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}): void {
  const { onNewTask, onCloseModal } = options;
  
  const status = useTimerStore((state) => state.status);
  const startTimer = useTimerStore((state) => state.startTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.tagName === 'SELECT';

    // Space - Toggle timer (only when not typing)
    if (event.code === 'Space' && !isInputFocused) {
      event.preventDefault();
      if (status === 'running') {
        pauseTimer();
      } else {
        playSound('timerStart');
        startTimer();
      }
      return;
    }

    // Cmd/Ctrl + N - New task
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault();
      onNewTask?.();
      return;
    }

    // Cmd/Ctrl + Shift + T - Toggle always on top
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 't') {
      event.preventDefault();
      window.electronAPI?.toggleAlwaysOnTop();
      return;
    }

    // Escape - Close modal
    if (event.key === 'Escape') {
      onCloseModal?.();
      return;
    }
  }, [status, startTimer, pauseTimer, onNewTask, onCloseModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
