import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStreakStore } from '../src/stores/streakStore';

// Helper to mock dates
const mockDate = (dateString: string): void => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(dateString));
};

const restoreDate = (): void => {
  vi.useRealTimers();
};

describe('streakStore', () => {
  beforeEach(() => {
    restoreDate();
    // Reset store state
    useStreakStore.setState({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: undefined,
      totalTasksCompleted: 0,
      badges: useStreakStore.getState().badges.map(b => ({ ...b, unlockedAt: undefined })),
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useStreakStore.getState();
      
      expect(state.currentStreak).toBe(0);
      expect(state.longestStreak).toBe(0);
      expect(state.lastCompletedDate).toBeUndefined();
      expect(state.totalTasksCompleted).toBe(0);
      expect(state.badges).toHaveLength(7);
    });

    it('should have all badges locked initially', () => {
      const { badges } = useStreakStore.getState();
      
      badges.forEach(badge => {
        expect(badge.unlockedAt).toBeUndefined();
      });
    });
  });

  describe('checkAndUpdateStreak', () => {
    it('should start streak at 1 on first completion', () => {
      mockDate('2024-01-15T12:00:00');
      
      const { checkAndUpdateStreak } = useStreakStore.getState();
      checkAndUpdateStreak(true);
      
      const state = useStreakStore.getState();
      expect(state.currentStreak).toBe(1);
      expect(state.longestStreak).toBe(1);
      expect(state.lastCompletedDate).toBe('2024-01-15');
      
      restoreDate();
    });

    it('should increment streak on consecutive days', () => {
      mockDate('2024-01-15T12:00:00');
      useStreakStore.setState({ 
        currentStreak: 5, 
        longestStreak: 5,
        lastCompletedDate: '2024-01-14', // Yesterday
      });
      
      const { checkAndUpdateStreak } = useStreakStore.getState();
      checkAndUpdateStreak(true);
      
      expect(useStreakStore.getState().currentStreak).toBe(6);
      expect(useStreakStore.getState().longestStreak).toBe(6);
      
      restoreDate();
    });

    it('should reset streak if day was missed', () => {
      mockDate('2024-01-17T12:00:00');
      useStreakStore.setState({ 
        currentStreak: 10, 
        longestStreak: 10,
        lastCompletedDate: '2024-01-15', // 2 days ago - missed yesterday
      });
      
      const { checkAndUpdateStreak } = useStreakStore.getState();
      checkAndUpdateStreak(true);
      
      expect(useStreakStore.getState().currentStreak).toBe(1);
      expect(useStreakStore.getState().longestStreak).toBe(10); // Longest preserved
      
      restoreDate();
    });

    it('should not update if already completed today', () => {
      mockDate('2024-01-15T12:00:00');
      useStreakStore.setState({ 
        currentStreak: 3, 
        lastCompletedDate: '2024-01-15', // Today
      });
      
      const { checkAndUpdateStreak } = useStreakStore.getState();
      checkAndUpdateStreak(true);
      
      expect(useStreakStore.getState().currentStreak).toBe(3); // Unchanged
      
      restoreDate();
    });

    it('should not update if tasks not complete', () => {
      const { checkAndUpdateStreak } = useStreakStore.getState();
      checkAndUpdateStreak(false);
      
      expect(useStreakStore.getState().currentStreak).toBe(0);
    });

    it('should update longest streak when current exceeds it', () => {
      mockDate('2024-01-15T12:00:00');
      useStreakStore.setState({ 
        currentStreak: 10, 
        longestStreak: 10,
        lastCompletedDate: '2024-01-14',
      });
      
      const { checkAndUpdateStreak } = useStreakStore.getState();
      checkAndUpdateStreak(true);
      
      expect(useStreakStore.getState().longestStreak).toBe(11);
      
      restoreDate();
    });
  });

  describe('incrementTasksCompleted', () => {
    it('should increment total tasks completed', () => {
      useStreakStore.setState({ totalTasksCompleted: 5 });
      
      const { incrementTasksCompleted } = useStreakStore.getState();
      incrementTasksCompleted();
      
      expect(useStreakStore.getState().totalTasksCompleted).toBe(6);
    });
  });

  describe('checkBadgeUnlock', () => {
    it('should unlock First Blood badge on first task', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ tasksCompleted: 1 });
      
      expect(badge).not.toBeNull();
      expect(badge?.id).toBe('first-blood');
      expect(badge?.unlockedAt).toBeDefined();
    });

    it('should unlock On Fire badge at 3-day streak', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ currentStreak: 3 });
      
      expect(badge?.id).toBe('on-fire');
    });

    it('should unlock Unstoppable badge at 7-day streak', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ currentStreak: 7 });
      
      expect(badge?.id).toBe('unstoppable');
    });

    it('should unlock Legend badge at 30-day streak', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ currentStreak: 30 });
      
      expect(badge?.id).toBe('legend');
    });

    it('should unlock Centurion badge at 100 tasks', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ tasksCompleted: 100 });
      
      expect(badge?.id).toBe('centurion');
    });

    it('should unlock Time Lord badge at 10 daily pomodoros', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ dailyPomodoros: 10 });
      
      expect(badge?.id).toBe('time-lord');
    });

    it('should unlock Sniper badge when completing under estimate', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ completedUnderEstimate: true });
      
      expect(badge?.id).toBe('sniper');
    });

    it('should not unlock already unlocked badge', () => {
      // First unlock
      const { checkBadgeUnlock } = useStreakStore.getState();
      checkBadgeUnlock({ tasksCompleted: 1 });
      
      // Try to unlock again
      const secondAttempt = checkBadgeUnlock({ tasksCompleted: 1 });
      
      expect(secondAttempt).toBeNull();
    });

    it('should return null if no badge conditions met', () => {
      const { checkBadgeUnlock } = useStreakStore.getState();
      
      const badge = checkBadgeUnlock({ tasksCompleted: 0 });
      
      expect(badge).toBeNull();
    });
  });

  describe('resetStreak', () => {
    it('should reset current streak to 0', () => {
      useStreakStore.setState({ currentStreak: 15 });
      
      const { resetStreak } = useStreakStore.getState();
      resetStreak();
      
      expect(useStreakStore.getState().currentStreak).toBe(0);
    });

    it('should preserve longest streak', () => {
      useStreakStore.setState({ currentStreak: 15, longestStreak: 20 });
      
      const { resetStreak } = useStreakStore.getState();
      resetStreak();
      
      expect(useStreakStore.getState().longestStreak).toBe(20);
    });
  });

  describe('getStreakStatus', () => {
    it('should show pending when completed yesterday but not today', () => {
      mockDate('2024-01-15T12:00:00');
      useStreakStore.setState({
        currentStreak: 5,
        lastCompletedDate: '2024-01-14', // Yesterday
      });

      const { getStreakStatus } = useStreakStore.getState();
      const status = getStreakStatus();

      expect(status.isPending).toBe(true);
      expect(status.isActive).toBe(true);
      expect(status.isCompletedToday).toBe(false);
      expect(status.potentialStreak).toBe(6);

      restoreDate();
    });

    it('should not be pending when completed today', () => {
      mockDate('2024-01-15T12:00:00');
      useStreakStore.setState({
        currentStreak: 5,
        lastCompletedDate: '2024-01-15', // Today
      });

      const { getStreakStatus } = useStreakStore.getState();
      const status = getStreakStatus();

      expect(status.isPending).toBe(false);
      expect(status.isCompletedToday).toBe(true);
      expect(status.potentialStreak).toBe(5);

      restoreDate();
    });

    it('should show potential streak of 1 when streak is broken', () => {
      mockDate('2024-01-17T12:00:00');
      useStreakStore.setState({
        currentStreak: 10,
        lastCompletedDate: '2024-01-15', // 2 days ago
      });

      const { getStreakStatus } = useStreakStore.getState();
      const status = getStreakStatus();

      expect(status.isPending).toBe(false);
      expect(status.isActive).toBe(false);
      expect(status.potentialStreak).toBe(1);

      restoreDate();
    });
  });

  describe('badge definitions', () => {
    it('should have all required badge properties', () => {
      const { badges } = useStreakStore.getState();
      
      badges.forEach(badge => {
        expect(badge.id).toBeDefined();
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
        expect(badge.icon).toBeDefined();
        expect(badge.condition).toBeDefined();
      });
    });

    it('should have unique badge IDs', () => {
      const { badges } = useStreakStore.getState();
      const ids = badges.map(b => b.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });
  });
});
