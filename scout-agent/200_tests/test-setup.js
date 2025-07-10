// Jest test setup file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.BACKEND_URL = 'https://test-backend.com';
process.env.AGENT_AUTH_TOKEN = 'test-token';

// Mock console methods globally to reduce test noise
const originalConsole = console;

beforeEach(() => {
  // Only mock console in test environment
  if (process.env.NODE_ENV === 'test') {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
  }
});

afterEach(() => {
  // Restore original console
  global.console = originalConsole;
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(30000);