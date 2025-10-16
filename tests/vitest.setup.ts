import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as Storage;

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as Storage;

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Mock fetch
global.fetch = vi.fn();

// Custom test utilities
export const testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  }),

  createMockEnergyData: () => ({
    id: 'energy-data-123',
    deviceId: 'device-123',
    timestamp: '2025-10-16T12:00:00.000Z',
    powerConsumption: 125.5,
    carbonFootprint: 0.08,
    metrics: {
      cpu: { usage: 45.2, temperature: 65.0 },
      memory: { usage: 50.0, total: 16384 },
      disk: { usage: 75.0, read: 100.5 }
    }
  }),

  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data))
  }),

  waitForElement: async (getElement: () => HTMLElement | null, timeout = 1000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = getElement();
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('Element not found within timeout');
  }
};

// Setup and teardown
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset fetch mock
  (global.fetch as any).mockClear();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});