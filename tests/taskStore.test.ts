import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../src/stores/taskStore';

describe('taskStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      recurringTasks: [],
    });
  });

  describe('addTask', () => {
    it('should add a new task with correct properties', () => {
      const { addTask } = useTaskStore.getState();
      
      addTask('Test task', 'high', 30);
      
      const { tasks } = useTaskStore.getState();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({
        title: 'Test task',
        priority: 'high',
        estimatedMinutes: 30,
        completed: false,
        pomodorosSpent: 0,
        isRecurring: false,
      });
      expect(tasks[0].id).toBeDefined();
      expect(tasks[0].createdAt).toBeDefined();
    });

    it('should add task without estimated time', () => {
      const { addTask } = useTaskStore.getState();
      
      addTask('Simple task', 'low');
      
      const { tasks } = useTaskStore.getState();
      expect(tasks[0].estimatedMinutes).toBeUndefined();
    });

    it('should increment order for each new task', () => {
      const { addTask } = useTaskStore.getState();
      
      addTask('Task 1', 'low');
      addTask('Task 2', 'medium');
      addTask('Task 3', 'high');
      
      const { tasks } = useTaskStore.getState();
      expect(tasks[0].order).toBe(0);
      expect(tasks[1].order).toBe(1);
      expect(tasks[2].order).toBe(2);
    });
  });

  describe('updateTask', () => {
    it('should update task properties', () => {
      const { addTask, updateTask } = useTaskStore.getState();
      
      addTask('Original title', 'low');
      const { tasks } = useTaskStore.getState();
      const taskId = tasks[0].id;
      
      updateTask(taskId, { title: 'Updated title', priority: 'high' });
      
      const updatedTasks = useTaskStore.getState().tasks;
      expect(updatedTasks[0].title).toBe('Updated title');
      expect(updatedTasks[0].priority).toBe('high');
    });

    it('should not affect other tasks', () => {
      const { addTask, updateTask } = useTaskStore.getState();
      
      addTask('Task 1', 'low');
      addTask('Task 2', 'medium');
      
      const { tasks } = useTaskStore.getState();
      updateTask(tasks[0].id, { title: 'Updated' });
      
      const updatedTasks = useTaskStore.getState().tasks;
      expect(updatedTasks[1].title).toBe('Task 2');
    });
  });

  describe('deleteTask', () => {
    it('should remove task from list', () => {
      const { addTask, deleteTask } = useTaskStore.getState();
      
      addTask('Task to delete', 'low');
      const { tasks } = useTaskStore.getState();
      const taskId = tasks[0].id;
      
      deleteTask(taskId);
      
      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });

    it('should only delete specified task', () => {
      const { addTask, deleteTask } = useTaskStore.getState();
      
      addTask('Task 1', 'low');
      addTask('Task 2', 'medium');
      
      const { tasks } = useTaskStore.getState();
      deleteTask(tasks[0].id);
      
      const remainingTasks = useTaskStore.getState().tasks;
      expect(remainingTasks).toHaveLength(1);
      expect(remainingTasks[0].title).toBe('Task 2');
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed with timestamp', () => {
      const { addTask, completeTask } = useTaskStore.getState();
      
      addTask('Task to complete', 'high');
      const { tasks } = useTaskStore.getState();
      
      const completedTask = completeTask(tasks[0].id);
      
      expect(completedTask).not.toBeNull();
      expect(completedTask?.completed).toBe(true);
      expect(completedTask?.completedAt).toBeDefined();
    });

    it('should set actual minutes when provided', () => {
      const { addTask, completeTask } = useTaskStore.getState();
      
      addTask('Timed task', 'medium', 30);
      const { tasks } = useTaskStore.getState();
      
      const completedTask = completeTask(tasks[0].id, 25);
      
      expect(completedTask?.actualMinutes).toBe(25);
    });

    it('should return null for non-existent task', () => {
      const { completeTask } = useTaskStore.getState();
      
      const result = completeTask('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('reorderTasks', () => {
    it('should reorder tasks correctly', () => {
      const { addTask, reorderTasks } = useTaskStore.getState();
      
      addTask('Task A', 'low');
      addTask('Task B', 'medium');
      addTask('Task C', 'high');
      
      // Move Task A (index 0) to index 2
      reorderTasks(0, 2);
      
      const { tasks } = useTaskStore.getState();
      expect(tasks[0].title).toBe('Task B');
      expect(tasks[1].title).toBe('Task C');
      expect(tasks[2].title).toBe('Task A');
    });

    it('should update order property after reorder', () => {
      const { addTask, reorderTasks } = useTaskStore.getState();
      
      addTask('Task A', 'low');
      addTask('Task B', 'medium');
      
      reorderTasks(1, 0);
      
      const { tasks } = useTaskStore.getState();
      expect(tasks[0].order).toBe(0);
      expect(tasks[1].order).toBe(1);
    });
  });

  describe('areAllTasksComplete', () => {
    it('should return false when no tasks exist', () => {
      const { areAllTasksComplete } = useTaskStore.getState();
      
      // Empty tasks array should return false (no tasks = no completion)
      expect(areAllTasksComplete()).toBe(false);
    });

    it('should return false when some tasks incomplete', () => {
      const { addTask, completeTask, areAllTasksComplete } = useTaskStore.getState();
      
      addTask('Task 1', 'low');
      addTask('Task 2', 'medium');
      
      const { tasks } = useTaskStore.getState();
      completeTask(tasks[0].id);
      
      expect(areAllTasksComplete()).toBe(false);
    });

    it('should return true when all tasks complete', () => {
      const { addTask, completeTask, areAllTasksComplete } = useTaskStore.getState();
      
      addTask('Task 1', 'low');
      addTask('Task 2', 'medium');
      
      const { tasks } = useTaskStore.getState();
      completeTask(tasks[0].id);
      completeTask(tasks[1].id);
      
      expect(areAllTasksComplete()).toBe(true);
    });
  });

  describe('recurring tasks', () => {
    it('should add recurring task template', () => {
      const { addRecurringTask } = useTaskStore.getState();
      
      addRecurringTask('Daily standup', 'high', 'daily', 15);
      
      const { recurringTasks } = useTaskStore.getState();
      expect(recurringTasks).toHaveLength(1);
      expect(recurringTasks[0]).toMatchObject({
        title: 'Daily standup',
        priority: 'high',
        frequency: 'daily',
        estimatedMinutes: 15,
        isActive: true,
      });
    });

    it('should toggle recurring task active state', () => {
      const { addRecurringTask, toggleRecurringTask } = useTaskStore.getState();
      
      addRecurringTask('Weekly review', 'medium', 'weekly');
      const { recurringTasks } = useTaskStore.getState();
      
      toggleRecurringTask(recurringTasks[0].id);
      
      expect(useTaskStore.getState().recurringTasks[0].isActive).toBe(false);
    });
  });
});
