import { useState, useCallback, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { playSound } from '../utils/sound';
import type { Task } from '../types';

interface UndoAction {
  type: 'delete' | 'complete' | 'update';
  task: Task;
  timestamp: number;
}

const UNDO_TIMEOUT_MS = 10000; // 10 seconds to undo

interface UseUndoRedoResult {
  canUndo: boolean;
  undoMessage: string | null;
  undo: () => void;
  pushUndo: (action: UndoAction) => void;
  clearUndo: () => void;
}

/**
 * Hook for undo/redo functionality on task actions.
 * Currently supports: delete, complete, update
 */
export function useUndoRedo(): UseUndoRedoResult {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  
  const updateTask = useTaskStore((state) => state.updateTask);
  const tasks = useTaskStore((state) => state.tasks);

  // Auto-clear old undo actions
  useEffect(() => {
    if (undoStack.length === 0) return;
    
    const timer = setTimeout(() => {
      const now = Date.now();
      setUndoStack((stack) => 
        stack.filter((action) => now - action.timestamp < UNDO_TIMEOUT_MS)
      );
    }, UNDO_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [undoStack]);

  const pushUndo = useCallback((action: UndoAction) => {
    setUndoStack((stack) => [...stack.slice(-4), action]); // Keep last 5
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const action = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));

    switch (action.type) {
      case 'delete':
        // Re-add the deleted task
        // We need to restore it with all its properties
        useTaskStore.setState({
          tasks: [...tasks, action.task].sort((a, b) => a.order - b.order),
        });
        useTaskStore.getState().saveToStorage();
        break;

      case 'complete':
        // Uncomplete the task
        updateTask(action.task.id, {
          completed: false,
          completedAt: undefined,
          actualMinutes: undefined,
          elapsedSeconds: action.task.elapsedSeconds,
          pointsEarned: 0,
        });
        break;

      case 'update':
        // Restore previous state
        updateTask(action.task.id, action.task);
        break;
    }

    playSound('click');
  }, [undoStack, tasks, updateTask]);

  const clearUndo = useCallback(() => {
    setUndoStack([]);
  }, []);

  const lastAction = undoStack[undoStack.length - 1];
  const undoMessage = lastAction
    ? `Undo ${lastAction.type}: "${lastAction.task.title.slice(0, 20)}${lastAction.task.title.length > 20 ? '...' : ''}"`
    : null;

  return {
    canUndo: undoStack.length > 0,
    undoMessage,
    undo,
    pushUndo,
    clearUndo,
  };
}
