import dotenv from 'dotenv';
import path from 'node:path';
import logger from './logger.js'; // Import logger

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate and export configuration values

// Transport type (stdio or http)
const transportTypeRaw = process.env.MCP_TRANSPORT?.toLowerCase() || 'stdio';
if (transportTypeRaw !== 'stdio' && transportTypeRaw !== 'http') {
  logger.warn(
    `Invalid MCP_TRANSPORT: "${transportTypeRaw}". Defaulting to "stdio".`
  ); // Use logger
  process.env.MCP_TRANSPORT = 'stdio'; // Correct the env var for consistency if needed
}
export const transportType = process.env.MCP_TRANSPORT || 'stdio';

// Port for HTTP transport
let port = 3001; // Default port
if (process.env.MCP_PORT) {
  try {
    const parsedPort = parseInt(process.env.MCP_PORT, 10);
    if (isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      logger.warn(
        { portInput: process.env.MCP_PORT },
        `Invalid MCP_PORT. Using default port ${port}.`
      ); // Use logger
    } else {
      port = parsedPort;
    }
  } catch (e) {
    logger.warn(
      { portInput: process.env.MCP_PORT, error: e },
      `Error parsing MCP_PORT. Using default port ${port}.`
    ); // Use logger
  }
}
export const serverPort = port;

// Add other configuration variables here as needed
export const logLevel = process.env.LOG_LEVEL || 'info'; // Export log level used by logger

// Custom greeting prefix (optional)
export const customGreetingPrefix = process.env.CUSTOM_GREETING_PREFIX || ''; // Default to empty string if not set

// Log loaded config using the logger
logger.info(
  { transportType, serverPort, logLevel, customGreetingPrefix },
  'Configuration loaded'
); // Use logger
