import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimerStore } from '../src/stores/timerStore';

describe('timerStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useTimerStore.setState({
      mode: 'work',
      status: 'idle',
      timeRemaining: 25 * 60,
      currentTaskId: null,
      pomodorosCompleted: 0,
      dailyPomodorosCompleted: 0,
      config: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useTimerStore.getState();
      
      expect(state.mode).toBe('work');
      expect(state.status).toBe('idle');
      expect(state.timeRemaining).toBe(25 * 60);
      expect(state.currentTaskId).toBeNull();
      expect(state.pomodorosCompleted).toBe(0);
    });
  });

  describe('startTimer', () => {
    it('should set status to running', () => {
      const { startTimer } = useTimerStore.getState();
      
      startTimer();
      
      expect(useTimerStore.getState().status).toBe('running');
    });

    it('should set currentTaskId when provided', () => {
      const { startTimer } = useTimerStore.getState();
      
      startTimer('task-123');
      
      expect(useTimerStore.getState().currentTaskId).toBe('task-123');
    });

    it('should not restart if already running', () => {
      const { startTimer } = useTimerStore.getState();
      
      startTimer();
      useTimerStore.setState({ timeRemaining: 1000 });
      startTimer(); // Try to start again
      
      // Time should not reset
      expect(useTimerStore.getState().timeRemaining).toBe(1000);
    });
  });

  describe('pauseTimer', () => {
    it('should set status to paused when running', () => {
      const { startTimer, pauseTimer } = useTimerStore.getState();
      
      startTimer();
      pauseTimer();
      
      expect(useTimerStore.getState().status).toBe('paused');
    });

    it('should not pause if not running', () => {
      const { pauseTimer } = useTimerStore.getState();
      
      pauseTimer();
      
      expect(useTimerStore.getState().status).toBe('idle');
    });
  });

  describe('resumeTimer', () => {
    it('should resume from paused state', () => {
      useTimerStore.setState({ status: 'paused', timeRemaining: 500 });
      
      const { resumeTimer } = useTimerStore.getState();
      resumeTimer();
      
      expect(useTimerStore.getState().status).toBe('running');
      expect(useTimerStore.getState().timeRemaining).toBe(500);
    });

    it('should not resume if not paused', () => {
      const { resumeTimer } = useTimerStore.getState();
      
      resumeTimer();
      
      expect(useTimerStore.getState().status).toBe('idle');
    });
  });

  describe('stopTimer', () => {
    it('should reset to idle work mode', () => {
      useTimerStore.setState({ 
        status: 'running', 
        mode: 'shortBreak',
        timeRemaining: 100,
        currentTaskId: 'task-123',
      });
      
      const { stopTimer } = useTimerStore.getState();
      stopTimer();
      
      const state = useTimerStore.getState();
      expect(state.status).toBe('idle');
      expect(state.mode).toBe('work');
      expect(state.timeRemaining).toBe(25 * 60);
      expect(state.currentTaskId).toBeNull();
    });
  });

  describe('tick', () => {
    it('should decrement time by 1 second when running', () => {
      useTimerStore.setState({ status: 'running', timeRemaining: 100 });
      
      const { tick } = useTimerStore.getState();
      tick();
      
      expect(useTimerStore.getState().timeRemaining).toBe(99);
    });

    it('should not tick when not running', () => {
      useTimerStore.setState({ status: 'idle', timeRemaining: 100 });
      
      const { tick } = useTimerStore.getState();
      tick();
      
      expect(useTimerStore.getState().timeRemaining).toBe(100);
    });

    it('should set to idle when time reaches 0', () => {
      useTimerStore.setState({ status: 'running', timeRemaining: 1 });
      
      const { tick } = useTimerStore.getState();
      tick();
      
      expect(useTimerStore.getState().timeRemaining).toBe(0);
      expect(useTimerStore.getState().status).toBe('idle');
    });
  });

  describe('skipToNext', () => {
    it('should transition from work to short break', () => {
      useTimerStore.setState({ mode: 'work', pomodorosCompleted: 0 });
      
      const { skipToNext } = useTimerStore.getState();
      skipToNext();
      
      const state = useTimerStore.getState();
      expect(state.mode).toBe('shortBreak');
      expect(state.pomodorosCompleted).toBe(1);
      expect(state.timeRemaining).toBe(5 * 60);
    });

    it('should transition to long break after 4 pomodoros', () => {
      useTimerStore.setState({ mode: 'work', pomodorosCompleted: 3 });
      
      const { skipToNext } = useTimerStore.getState();
      skipToNext();
      
      const state = useTimerStore.getState();
      expect(state.mode).toBe('longBreak');
      expect(state.pomodorosCompleted).toBe(4);
      expect(state.timeRemaining).toBe(15 * 60);
    });

    it('should transition from break back to work', () => {
      useTimerStore.setState({ mode: 'shortBreak' });
      
      const { skipToNext } = useTimerStore.getState();
      skipToNext();
      
      expect(useTimerStore.getState().mode).toBe('work');
    });
  });

  describe('setWorkDuration', () => {
    it('should update work duration in config', () => {
      const { setWorkDuration } = useTimerStore.getState();
      
      setWorkDuration(30);
      
      expect(useTimerStore.getState().config.workMinutes).toBe(30);
    });

    it('should update timeRemaining if in idle work mode', () => {
      useTimerStore.setState({ mode: 'work', status: 'idle' });
      
      const { setWorkDuration } = useTimerStore.getState();
      setWorkDuration(45);
      
      expect(useTimerStore.getState().timeRemaining).toBe(45 * 60);
    });

    it('should not update timeRemaining if timer is running', () => {
      useTimerStore.setState({ mode: 'work', status: 'running', timeRemaining: 1000 });
      
      const { setWorkDuration } = useTimerStore.getState();
      setWorkDuration(45);
      
      expect(useTimerStore.getState().timeRemaining).toBe(1000);
    });
  });

  describe('getFormattedTime', () => {
    it('should format time correctly', () => {
      useTimerStore.setState({ timeRemaining: 125, mode: 'work' }); // 2:05
      
      const { getFormattedTime } = useTimerStore.getState();
      const formatted = getFormattedTime();
      
      expect(formatted).toBe('🍅 02:05');
    });

    it('should use coffee icon for breaks', () => {
      useTimerStore.setState({ timeRemaining: 300, mode: 'shortBreak' });
      
      const { getFormattedTime } = useTimerStore.getState();
      const formatted = getFormattedTime();
      
      expect(formatted).toContain('☕');
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage', () => {
      useTimerStore.setState({ 
        mode: 'work', 
        timeRemaining: 750, // 12:30 remaining of 25:00
        config: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakInterval: 4 },
      });
      
      const { getProgress } = useTimerStore.getState();
      const progress = getProgress();
      
      // (1500 - 750) / 1500 * 100 = 50%
      expect(progress).toBe(50);
    });
  });
});
