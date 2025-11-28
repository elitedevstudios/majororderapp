import { beforeAll, afterEach, vi } from 'vitest';

// Mock window.electronAPI for tests
beforeAll(() => {
  const mockStore: Record<string, unknown> = {};
  
  Object.defineProperty(window, 'electronAPI', {
    value: {
      store: {
        get: vi.fn((key: string) => Promise.resolve(mockStore[key])),
        set: vi.fn((key: string, value: unknown) => {
          mockStore[key] = value;
          return Promise.resolve();
        }),
        delete: vi.fn((key: string) => {
          delete mockStore[key];
          return Promise.resolve();
        }),
      },
      updateTimer: vi.fn(),
      toggleAlwaysOnTop: vi.fn(),
      getAlwaysOnTop: vi.fn(() => Promise.resolve(false)),
    },
    writable: true,
  });
});

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock matchMedia for CSS media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
