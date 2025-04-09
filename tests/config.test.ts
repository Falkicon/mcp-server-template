import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock logger before any imports that might use it
vi.mock('../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Define types for the config module if not explicitly exported
interface ConfigModule {
  transportType: string;
  serverPort: number;
  logLevel: string;
}

describe('Configuration Loading', () => {

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Ensure modules are reset to pick up new env vars
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment variables after each test
    vi.unstubAllEnvs();
  });

  // Helper to load config *after* env is stubbed
  const loadConfig = async (): Promise<ConfigModule> => {
    const config = await import('../src/config.js');
    return config;
  };

  it('should load default configuration values', async () => {
    // Ensure relevant env vars are unset
    vi.stubEnv('MCP_TRANSPORT', '');
    vi.stubEnv('MCP_PORT', '');
    vi.stubEnv('LOG_LEVEL', '');

    const config = await loadConfig();

    expect(config.transportType).toBe('stdio');
    expect(config.serverPort).toBe(3001);
    expect(config.logLevel).toBe('info');
  });

  it('should load configuration from environment variables', async () => {
    vi.stubEnv('MCP_TRANSPORT', 'http');
    vi.stubEnv('MCP_PORT', '4000');
    vi.stubEnv('LOG_LEVEL', 'debug');

    const config = await loadConfig();

    expect(config.transportType).toBe('http');
    expect(config.serverPort).toBe(4000);
    expect(config.logLevel).toBe('debug');
  });

  it('should handle invalid MCP_TRANSPORT gracefully', async () => {
    vi.stubEnv('MCP_TRANSPORT', 'invalid');
    const config = await loadConfig();
    expect(config.transportType).toBe('stdio'); // Should default to stdio
  });

  it('should handle invalid MCP_PORT gracefully', async () => {
    vi.stubEnv('MCP_PORT', 'invalid');
    let config = await loadConfig();
    expect(config.serverPort).toBe(3001);

    // Need to reset modules again before re-stubbing and re-importing
    vi.resetModules();
    vi.stubEnv('MCP_PORT', '-100');
    config = await loadConfig();
    expect(config.serverPort).toBe(3001);

    vi.resetModules();
    vi.stubEnv('MCP_PORT', '70000');
    config = await loadConfig();
    expect(config.serverPort).toBe(3001);
  });

  it('should load configuration with mixed defaults and env vars', async () => {
    vi.stubEnv('MCP_TRANSPORT', 'http');
    vi.stubEnv('MCP_PORT', ''); // Unset port

    const config = await loadConfig();

    expect(config.transportType).toBe('http');
    expect(config.serverPort).toBe(3001); // Default port
  });
});
