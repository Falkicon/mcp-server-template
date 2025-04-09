import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Vitest configuration options
    globals: true, // Optional: Use true to avoid importing describe, it, etc.
    environment: 'node', // Set the test environment
    include: ['tests/**/*.test.ts'], // Pattern for test files
    // Add other configurations like setup files, coverage, etc. as needed
    // coverage: {
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    // },
  },
});
