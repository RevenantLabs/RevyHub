import { vi } from "vitest";

// Create a mock storage object
const mockStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  })
};

// Set up the mock before tests run
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true
});

// Export for use in tests
export { mockStorage, localStorageMock };
