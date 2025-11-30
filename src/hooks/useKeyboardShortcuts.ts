import { useEffect, useCallback } from 'react';
import { useStopwatchStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';

interface KeyboardShortcutsOptions {
  onNewTask?: () => void;
  onCloseModal?: () => void;
  onToggleFocus?: () => void;
  onCompleteActiveTask?: () => void;
  onUndo?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}): void {
  const { onNewTask, onCloseModal, onToggleFocus, onCompleteActiveTask, onUndo } = options;
  
  const activeTaskId = useStopwatchStore((state) => state.activeTaskId);
  const stopwatchStatus = useStopwatchStore((state) => state.status);
  const startStopwatch = useStopwatchStore((state) => state.startStopwatch);
  const stopStopwatch = useStopwatchStore((state) => state.stopStopwatch);
  const tasks = useTaskStore((state) => state.tasks);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.tagName === 'SELECT';

    // Cmd/Ctrl + Z - Undo
    if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      onUndo?.();
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

    // Cmd/Ctrl + F - Toggle focus mode
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault();
      onToggleFocus?.();
      return;
    }

    // Space - Start/stop stopwatch on first incomplete task (when not in input)
    if (event.code === 'Space' && !isInputFocused) {
      event.preventDefault();
      
      if (stopwatchStatus === 'running' && activeTaskId) {
        // Stop current task
        stopStopwatch();
      } else {
        // Start first incomplete task
        const firstIncomplete = tasks.find((t) => !t.completed);
        if (firstIncomplete) {
          startStopwatch(firstIncomplete.id);
        }
      }
      return;
    }

    // Enter - Complete active task (when not in input)
    if (event.key === 'Enter' && !isInputFocused && activeTaskId) {
      event.preventDefault();
      onCompleteActiveTask?.();
      return;
    }

    // Escape - Close modal
    if (event.key === 'Escape') {
      onCloseModal?.();
      return;
    }
  }, [onNewTask, onCloseModal, onToggleFocus, onCompleteActiveTask, onUndo, 
      activeTaskId, stopwatchStatus, startStopwatch, stopStopwatch, tasks]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
