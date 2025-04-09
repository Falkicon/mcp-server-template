// Base class for application-specific errors
export class AppError extends Error {
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name; // Set error name to class name
    this.context = context;
    // Maintain stack trace (relevant for V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Specific error for tool execution issues
export class ToolExecutionError extends AppError {
  constructor(
    toolName: string,
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(`Error executing tool "${toolName}": ${message}`, {
      ...context,
      toolName,
    });
    if (cause) {
      // Pino typically handles nested errors well, but preserving the cause might be useful
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).cause = cause;
    }
  }
}

// Add other specific error types as needed (e.g., ResourceReadError, ConfigurationError)
