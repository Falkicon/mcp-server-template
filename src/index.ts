import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import logger from './logger.js'; // Import the configured logger
import { customGreetingPrefix } from './config.js'; // Import custom prefix
import { ToolExecutionError, AppError } from './errors.js'; // Import custom error and AppError

/**
 * MCP Server Template
 *
 * This is a minimal but complete MCP server implementation meant to serve as a
 * starting point for building your own MCP servers.
 *
 * It demonstrates:
 * - Basic server setup
 * - Tool implementation
 * - Resource handling
 * - Prompt creation
 * - Error handling
 *
 * IMPORTANT NOTES:
 * 1. All debugging logs MUST be written to stderr, not stdout
 * 2. In stdio mode, stdout is strictly reserved for JSON-RPC messages
 * 3. Tool names are automatically prefixed by Cursor (e.g., 'add' becomes 'mcp_mcp_minimal_add')
 * 4. The AI assistant can call tools directly using the prefixed name format
 */

// Create the server with basic configuration
const server = new McpServer({
  name: 'MCP Template Server',
  version: '1.0.0',
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
  },
});

// Use the central logger configured in logger.ts
const log = logger;

// Safe logging function that writes to stderr to avoid interfering with stdio protocol
// CRITICAL: Never use console.log() as it writes to stdout and breaks the JSON-RPC protocol
// const log = {
//   info: (message: string) => process.stderr.write(`[INFO] ${message}\n`),
//   error: (message: string, error?: unknown) => {
//     process.stderr.write(`[ERROR] ${message}\n`);
//     if (error instanceof Error) {
//       process.stderr.write(`[ERROR] ${error.message}\n${error.stack}\n`);
//     }
//   }
// };

// ==== TOOLS ====

// 1. Add Tool - Adds two numbers and returns the result
const AddToolArgsSchema = z.object({
  number1: z.number().describe('The first number to add.'),
  number2: z.number().describe('The second number to add.'),
});

/**
 * Handler function for the 'add' tool
 */
async function handleAddTool({
  number1,
  number2,
}: {
  number1: number;
  number2: number;
}) {
  const toolName = 'add';
  try {
    log.info(`Executing ${toolName} tool with ${number1} and ${number2}`);
    const sum = number1 + number2;

    // Simulate a potential error for demonstration (e.g., if numbers are too large)
    if (Math.abs(number1) > 1e15 || Math.abs(number2) > 1e15) {
      throw new Error('Input numbers are too large for precise calculation.');
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `The sum of ${number1} and ${number2} is ${sum}.`,
        },
      ],
    };
  } catch (error) {
    // Log and re-throw as a specific error
    const toolError = new ToolExecutionError(
      toolName,
      'Failed to calculate sum',
      error instanceof Error ? error : undefined,
      { number1, number2 }
    );
    log.error({ err: toolError }, toolError.message);
    throw toolError;
  }
}

// Register the tool
// Note: Cursor automatically creates a prefixed version for AI tool calling
// (e.g., 'add' becomes 'mcp_mcp_minimal_add' for the AI to call)
server.tool(
  'add',
  'Adds two numbers together and returns the sum',
  {
    number1: AddToolArgsSchema.shape.number1,
    number2: AddToolArgsSchema.shape.number2,
  },
  handleAddTool
);

// 2. Greet Tool - Greets a person
const GreetToolArgsSchema = z.object({
  name: z.string().describe('The name of the person to greet.'),
  greeting: z
    .string()
    .optional()
    .default('Hello')
    .describe('The greeting phrase to use (optional).'),
});

/**
 * Handler function for the 'greet' tool
 */
export async function handleGreetTool({
  name,
  greeting,
}: {
  name: string;
  greeting: string;
}) {
  const toolName = 'greet';
  try {
    log.info(`Executing ${toolName} tool for ${name}`);

    // Apply the custom prefix if it exists
    const actualGreeting = customGreetingPrefix
      ? `${customGreetingPrefix}${greeting}`
      : greeting;

    const message = `${actualGreeting}, ${name}!`;

    return {
      content: [
        {
          type: 'text' as const,
          text: message,
        },
      ],
    };
  } catch (error) {
    // Log and re-throw as a specific error
    const toolError = new ToolExecutionError(
      toolName,
      'Failed to generate greeting',
      error instanceof Error ? error : undefined,
      { name, greeting }
    );
    log.error({ err: toolError }, toolError.message);
    throw toolError;
  }
}

// Register the tool
// Note: Cursor automatically creates a prefixed version for AI tool calling
// (e.g., 'greet' becomes 'mcp_mcp_minimal_greet' for the AI to call)
server.tool(
  'greet',
  'Greets the specified person',
  {
    name: GreetToolArgsSchema.shape.name,
    greeting: GreetToolArgsSchema.shape.greeting,
  },
  handleGreetTool
);

// ==== RESOURCES ====

/**
 * Handler function for the welcome message resource
 */
async function handleWelcomeResource(uri: URL) {
  const resourceName = 'welcome';
  try {
    log.info(`Accessing welcome resource at ${uri.href}`);

    return {
      contents: [
        {
          uri: uri.href,
          text: 'Welcome to the MCP Template Server! This is a static resource example.',
        },
      ],
    };
  } catch (error) {
    const resourceError = new AppError(
      `Error accessing resource "${resourceName}"`,
      { uri: uri.href, cause: error }
    );
    log.error({ err: resourceError }, resourceError.message);
    throw resourceError;
  }
}

// Register the resource
server.resource(
  'welcome',
  'system://welcome',
  {
    description: 'A welcome message resource',
  },
  handleWelcomeResource
);

// ==== PROMPTS ====

/**
 * Handler function for a simple summary prompt
 */
const SummaryPromptArgsSchema = z.object({
  topic: z.string().describe('The topic to summarize'),
});

server.prompt(
  'summarize',
  {
    topic: SummaryPromptArgsSchema.shape.topic,
  },
  ({ topic }) => {
    const promptName = 'summarize';
    try {
      log.info(`Creating summary prompt for topic: ${topic}`);

      if (!topic || topic.trim().length === 0) {
        throw new Error('Topic cannot be empty.');
      }

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please provide a brief summary of the following topic: ${topic}`,
            },
          },
        ],
      };
    } catch (error) {
      const promptError = new AppError(
        `Error creating prompt "${promptName}"`,
        { topic, cause: error }
      );
      log.error({ err: promptError }, promptError.message);
      throw promptError;
    }
  }
);

// Start the server using stdio transport
async function startServer() {
  log.info('Starting MCP Template Server...');

  // Simple check for stdio flag
  if (process.argv.includes('--stdio')) {
    try {
      log.info('Initializing stdio transport');
      const transport = new StdioServerTransport();

      // Connect to the transport
      log.info('Connecting to transport...');
      await server.connect(transport);
      log.info('Server started successfully');

      // Error handling
      process.on('uncaughtException', (error) => {
        log.error({ err: error }, 'Uncaught exception'); // Log error object with pino
        process.exit(1);
      });

      process.on('unhandledRejection', (reason) => {
        log.error({ reason }, 'Unhandled rejection'); // Log reason object with pino
        process.exit(1);
      });
    } catch (error) {
      log.error({ err: error }, 'Failed to start server'); // Log error object with pino
      process.exit(1);
    }
  } else {
    log.error('This server only supports stdio transport. Use --stdio flag.');
    process.exit(1);
  }
}

// Start the server
// Only start the server automatically if not in a test environment
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST;
if (!isTestEnv) {
  startServer();
}
