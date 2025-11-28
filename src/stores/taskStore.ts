import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Task, RecurringTask, Priority } from '../types';

interface TaskState {
  tasks: Task[];
  recurringTasks: RecurringTask[];
  
  // Task actions
  addTask: (title: string, priority: Priority, estimatedMinutes?: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, actualMinutes?: number) => Task | null;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  
  // Recurring task actions
  addRecurringTask: (title: string, priority: Priority, frequency: 'daily' | 'weekly', estimatedMinutes?: number, dayOfWeek?: number) => void;
  updateRecurringTask: (id: string, updates: Partial<RecurringTask>) => void;
  deleteRecurringTask: (id: string) => void;
  toggleRecurringTask: (id: string) => void;
  generateRecurringTasks: () => void;
  
  // Queries
  getTodaysTasks: () => Task[];
  getIncompleteTasks: () => Task[];
  areAllTasksComplete: () => boolean;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const getToday = (): string => new Date().toISOString().split('T')[0];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  recurringTasks: [],

  addTask: (title, priority, estimatedMinutes) => {
    const tasks = get().tasks;
    const newTask: Task = {
      id: uuidv4(),
      title,
      priority,
      order: tasks.length,
      completed: false,
      estimatedMinutes,
      pomodorosSpent: 0,
      createdAt: Date.now(),
      isRecurring: false,
    };
    set({ tasks: [...tasks, newTask] });
    get().saveToStorage();
  },

  updateTask: (id, updates) => {
    set({
      tasks: get().tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    });
    get().saveToStorage();
  },

  deleteTask: (id) => {
    set({
      tasks: get().tasks.filter((task) => task.id !== id),
    });
    get().saveToStorage();
  },

  completeTask: (id, actualMinutes) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return null;
    
    const completedTask = {
      ...task,
      completed: true,
      completedAt: Date.now(),
      actualMinutes: actualMinutes ?? task.actualMinutes,
    };
    
    set({
      tasks: get().tasks.map((t) => (t.id === id ? completedTask : t)),
    });
    get().saveToStorage();
    return completedTask;
  },

  reorderTasks: (startIndex, endIndex) => {
    const tasks = [...get().tasks];
    const [removed] = tasks.splice(startIndex, 1);
    tasks.splice(endIndex, 0, removed);
    
    // Update order property
    const reorderedTasks = tasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    
    set({ tasks: reorderedTasks });
    get().saveToStorage();
  },

  addRecurringTask: (title, priority, frequency, estimatedMinutes, dayOfWeek) => {
    const newRecurring: RecurringTask = {
      id: uuidv4(),
      title,
      priority,
      frequency,
      estimatedMinutes,
      dayOfWeek,
      isActive: true,
    };
    set({ recurringTasks: [...get().recurringTasks, newRecurring] });
    get().saveToStorage();
  },

  updateRecurringTask: (id, updates) => {
    set({
      recurringTasks: get().recurringTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    });
    get().saveToStorage();
  },

  deleteRecurringTask: (id) => {
    set({
      recurringTasks: get().recurringTasks.filter((task) => task.id !== id),
    });
    get().saveToStorage();
  },

  toggleRecurringTask: (id) => {
    set({
      recurringTasks: get().recurringTasks.map((task) =>
        task.id === id ? { ...task, isActive: !task.isActive } : task
      ),
    });
    get().saveToStorage();
  },

  generateRecurringTasks: () => {
    const today = getToday();
    const dayOfWeek = new Date().getDay();
    const { recurringTasks, tasks } = get();
    const newTasks: Task[] = [];

    recurringTasks.forEach((recurring) => {
      if (!recurring.isActive) return;
      if (recurring.lastGenerated === today) return;
      
      // Check frequency
      if (recurring.frequency === 'weekly' && recurring.dayOfWeek !== dayOfWeek) {
        return;
      }

      // Check if task already exists for today
      const existingTask = tasks.find(
        (t) => t.recurringTemplateId === recurring.id && 
               new Date(t.createdAt).toISOString().split('T')[0] === today
      );
      if (existingTask) return;

      // Create new task from template
      newTasks.push({
        id: uuidv4(),
        title: recurring.title,
        priority: recurring.priority,
        order: tasks.length + newTasks.length,
        completed: false,
        estimatedMinutes: recurring.estimatedMinutes,
        pomodorosSpent: 0,
        createdAt: Date.now(),
        isRecurring: true,
        recurringTemplateId: recurring.id,
      });
    });

    if (newTasks.length > 0) {
      // Update lastGenerated for processed recurring tasks
      const updatedRecurring = recurringTasks.map((r) => {
        const wasGenerated = newTasks.some((t) => t.recurringTemplateId === r.id);
        return wasGenerated ? { ...r, lastGenerated: today } : r;
      });

      set({
        tasks: [...tasks, ...newTasks],
        recurringTasks: updatedRecurring,
      });
      get().saveToStorage();
    }
  },

  getTodaysTasks: () => {
    const today = getToday();
    return get().tasks.filter((task) => {
      const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
      return taskDate === today || !task.completed;
    });
  },

  getIncompleteTasks: () => {
    return get().tasks.filter((task) => !task.completed);
  },

  areAllTasksComplete: () => {
    const todaysTasks = get().getTodaysTasks();
    return todaysTasks.length > 0 && todaysTasks.every((task) => task.completed);
  },

  loadFromStorage: async () => {
    try {
      const tasks = await window.electronAPI.store.get('tasks') as Task[] | undefined;
      const recurringTasks = await window.electronAPI.store.get('recurringTasks') as RecurringTask[] | undefined;
      
      // Clean up old completed tasks (keep last 7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const cleanedTasks = (tasks || []).filter((task) => {
        if (!task.completed) return true;
        return (task.completedAt || task.createdAt) > sevenDaysAgo;
      });
      
      set({
        tasks: cleanedTasks,
        recurringTasks: recurringTasks || [],
      });
      
      // Generate recurring tasks for today
      get().generateRecurringTasks();
      
      // Save if we cleaned up any tasks
      if (tasks && cleanedTasks.length !== tasks.length) {
        get().saveToStorage();
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
    }
  },

  saveToStorage: async () => {
    try {
      await window.electronAPI.store.set('tasks', get().tasks);
      await window.electronAPI.store.set('recurringTasks', get().recurringTasks);
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
    }
  },
}));
