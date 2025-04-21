import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables if they exist
dotenv.config({ path: path.resolve('.env.test') });

// Global setup
beforeAll(() => {
  // Set timeout for integration tests
  jest.setTimeout(10000);
});

afterAll(() => {
  // Any global cleanup
});
