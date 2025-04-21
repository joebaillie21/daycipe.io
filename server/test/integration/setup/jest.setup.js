import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Global setup
beforeAll(() => {
  // Set timeout for integration tests
  jest.setTimeout(10000);
});

afterAll(() => {
  // Any global cleanup
});
