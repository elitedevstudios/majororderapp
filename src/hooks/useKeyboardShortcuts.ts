import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onNewTask?: () => void;
  onCloseModal?: () => void;
  onToggleFocus?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}): void {
  const { onNewTask, onCloseModal, onToggleFocus } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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

    // Cmd/Ctrl + F - Toggle focus mode
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault();
      onToggleFocus?.();
      return;
    }

    // Escape - Close modal
    if (event.key === 'Escape') {
      onCloseModal?.();
      return;
    }
  }, [onNewTask, onCloseModal, onToggleFocus]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
