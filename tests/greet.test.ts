import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGreetTool } from '../src/index.js';
import { ToolExecutionError } from '../src/errors.js';
import logger from '../src/logger.js';
import { customGreetingPrefix } from '../src/config.js';

// Mock the logger
vi.mock('../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Greet Tool Handler', () => {
  // Remove the unused mockExtra variable
  // const mockExtra: unknown = {};

  // Clear mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a default greeting (with prefix)', async () => {
    const args = { name: 'World', greeting: 'Hello' };
    const result = await handleGreetTool(args);
    const expectedText = `${customGreetingPrefix}Hello, World!`;
    expect(result.content).toEqual([{ type: 'text', text: expectedText }]);
  });

  it('should return a custom greeting (with prefix)', async () => {
    const args = { name: 'Alice', greeting: 'Hi' };
    const result = await handleGreetTool(args);
    const expectedText = `${customGreetingPrefix}Hi, Alice!`;
    expect(result.content).toEqual([{ type: 'text', text: expectedText }]);
  });

  it('should handle empty name with default greeting (with prefix)', async () => {
    const args = { name: '', greeting: 'Hello' };
    const result = await handleGreetTool(args);
    const expectedText = `${customGreetingPrefix}Hello, !`;
    expect(result.content).toEqual([{ type: 'text', text: expectedText }]);
  });

  // Note: This test doesn't trigger a specific error path in the current handler
  // It verifies that if an unexpected error *were* to occur, it's wrapped correctly.
  it('should wrap unexpected errors in ToolExecutionError', async () => {
    // Mock logger.info temporarily to simulate an error *inside* the handler
    const originalInfo = logger.info;
    const mockError = new Error('Unexpected runtime error');
    logger.info = vi.fn(() => {
      throw mockError;
    });

    const args = { name: 'Test', greeting: 'Hello' };
    await expect(handleGreetTool(args)).rejects.toThrow(ToolExecutionError);
    await expect(handleGreetTool(args)).rejects.toThrow(
      /^Error executing tool "greet": Failed to generate greeting/
    );

    // Restore original logger
    logger.info = originalInfo;
  });
});
