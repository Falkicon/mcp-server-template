import pino, { type LoggerOptions } from 'pino';

// Determine log level from environment or default
const logLevel = process.env.LOG_LEVEL || 'info';

// Configure Pino options
const pinoOptions: LoggerOptions = {
  level: logLevel,
};

// Enable pretty printing for non-production environments
if (process.env.NODE_ENV !== 'production') {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:standard',
    },
  };
}

// Create and export the logger instance
const logger = pino.default(pinoOptions);

export default logger;
