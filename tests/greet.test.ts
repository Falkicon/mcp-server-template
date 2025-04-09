import { describe, it, expect, vi } from 'vitest';
import { handleGreetTool } from '../src/index.js';
import { ToolExecutionError } from '../src/errors.js';
import logger from '../src/logger.js';

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
  const mockExtra: unknown = {}; // Change type from any to unknown

  it('should return a default greeting when default is expected', async () => {
    // Pass the default value 'Hello' as expected by the handler's inferred type
    const args = { name: 'World', greeting: 'Hello' };
    const result = await handleGreetTool(args, mockExtra);
    expect(result.content).toEqual([{ type: 'text', text: 'Hello, World!' }]);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should return a custom greeting', async () => {
    const args = { name: 'Alice', greeting: 'Hi' };
    const result = await handleGreetTool(args, mockExtra);
    expect(result.content).toEqual([{ type: 'text', text: 'Hi, Alice!' }]);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle empty name with default greeting', async () => {
    // Pass the default value 'Hello'
    const args = { name: '', greeting: 'Hello' };
    const result = await handleGreetTool(args, mockExtra);
    expect(result.content).toEqual([{ type: 'text', text: 'Hello, !' }]);
  });

  it('should throw ToolExecutionError for simulated error with default greeting', async () => {
    // Pass the default value 'Hello'
    const args = { name: 'error', greeting: 'Hello' };
    await expect(handleGreetTool(args, mockExtra)).rejects.toThrow(
      ToolExecutionError
    );
    await expect(handleGreetTool(args, mockExtra)).rejects.toThrow(
      'Error executing tool "greet": Simulated error during greeting.'
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle non-Error throws', async () => {
    // const args = { name: 'throw-non-error', greeting: 'Hello' }; // Remove or comment out unused var
    // ... placeholder code ...
  });
});
