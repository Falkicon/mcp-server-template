import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { transportType, serverPort } from './config.js'; // Import config
import logger from './logger.js'; // Import logger
import { ToolExecutionError } from './errors.js'; // Import custom error

// --- Configuration removed - now handled in config.ts ---
// const transportType = process.env.MCP_TRANSPORT?.toLowerCase() || 'stdio';
// const port = parseInt(process.env.MCP_PORT || '3001', 10);
// ------------------------------------------------------

// Basic server setup
const server = new McpServer({
  name: 'MCP Boilerplate Server',
  // Consider loading version from package.json dynamically
  version: '1.0.0',
  // Optional: Add capabilities if needed
  // capabilities: { }
});

// --- Primitives (Tasks T08, T09, T10) ---

// --- Tool: Greet ---
const GreetToolArgsSchema = z.object({
  name: z.string().describe('The name of the person to greet.'),
  greeting: z
    .string()
    .optional()
    .default('Hello')
    .describe('The greeting phrase to use (optional).'),
});
type GreetToolArgs = z.infer<typeof GreetToolArgsSchema>;

// Exported handler function for testing
/* export */ async function handleGreetTool(
  { name, greeting }: GreetToolArgs,
  _extra: unknown
) {
  const toolName = 'greet';
  logger.info({ name, greeting, toolName }, `Executing ${toolName} tool`);
  try {
    if (name.toLowerCase() === 'error') {
      throw new Error('Simulated error during greeting.');
    }
    const message = `${greeting}, ${name}!`;
    return {
      content: [{ type: 'text', text: message }] as {
        type: 'text';
        text: string;
      }[],
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      { err, name, greeting, toolName },
      `Error executing ${toolName} tool`
    );
    throw new ToolExecutionError(toolName, err.message, err, {
      name,
      greeting,
    });
  }
}

server.tool(
  'greet',
  {
    // Argument schema definition
    name: GreetToolArgsSchema.shape.name,
    greeting: GreetToolArgsSchema.shape.greeting,
  },
  handleGreetTool // Use the handler (now accepts _extra param)
);

// --- Resource: Welcome Message ---
server.resource(
  'welcome-message',
  'system://welcome',
  {
    // Metadata
    description: 'Provides a static welcome message.',
  },
  async (uri: URL, _extra: unknown) => {
    logger.info({ uri: uri.href }, `Providing static resource`);
    return {
      contents: [
        {
          uri: uri.href,
          text: 'Welcome to the MCP Boilerplate Server!',
        },
      ],
    };
  }
);

// --- Prompt: Summarize Topic ---
const SummarizePromptArgsSchema = z.object({
  topic: z.string().describe('The topic to summarize.'),
});
type SummarizePromptArgs = z.infer<typeof SummarizePromptArgsSchema>;

server.prompt(
  'summarize-topic',
  {
    // Argument schema definition
    topic: SummarizePromptArgsSchema.shape.topic,
  },
  ({ topic }: SummarizePromptArgs, _extra: unknown) => {
    logger.info({ topic }, `Generating summarize prompt`);
    return {
      messages: [
        {
          role: 'user',
          // Correct content structure (single object for single part)
          content: {
            type: 'text',
            text: `Please provide a brief summary of the following topic: ${topic}`,
          },
        },
      ],
    };
  }
  // Description can be added via Zod .describe() if supported by clients
);

// --- Transport setup (Tasks T06, T07) ---
async function startServer() {
  logger.info({ transport: transportType }, `Starting MCP server...`);

  if (transportType === 'stdio') {
    logger.info('Connecting via stdio...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Server connected via stdio.');
  } else if (transportType === 'http') {
    logger.info({ port: serverPort }, `Setting up HTTP/SSE server...`);
    const app = express();

    // Keep track of active transports by session ID
    const transports: { [sessionId: string]: SSEServerTransport } = {};

    // SSE endpoint for client connections
    app.get('/sse', async (_req: Request, res: Response) => {
      logger.info('Client connected via SSE');
      const messageEndpoint = '/messages'; // Path for client to send messages back
      const transport = new SSEServerTransport(messageEndpoint, res);
      transports[transport.sessionId] = transport;
      const sessionId = transport.sessionId;

      res.on('close', () => {
        logger.info({ sessionId }, `Client disconnected (SSE session closed)`);
        delete transports[sessionId];
      });

      try {
        await server.connect(transport);
        logger.info({ sessionId }, `Server connected to SSE client`);
      } catch (error) {
        logger.error(
          { err: error, sessionId },
          'Error connecting McpServer to SSE transport'
        );
        if (!res.closed) {
          res.end();
        }
        delete transports[sessionId];
      }
    });

    // Endpoint for clients to POST messages back to the server
    app.post(
      '/messages',
      express.raw({ type: 'application/json' }),
      async (req: Request, res: Response) => {
        const sessionId = req.query.sessionId as string;
        const transport = transports[sessionId];
        if (transport) {
          logger.debug({ sessionId }, `Received POST message`);
          try {
            await transport.handlePostMessage(req, res);
            logger.debug({ sessionId }, `Successfully processed POST message`);
          } catch (error) {
            logger.error(
              { err: error, sessionId },
              `Error handling POST message`
            );
            if (!res.headersSent) {
              res.status(500).send('Error processing message');
            }
          }
        } else {
          logger.warn(
            { sessionId },
            `No active transport found for POST message`
          );
          res.status(400).send('No transport found for sessionId');
        }
      }
    );

    // Use imported config value for port
    app.listen(serverPort, () => {
      logger.info({ port: serverPort }, `MCP Server (HTTP/SSE) listening`);
      logger.debug(` -> SSE connections: http://localhost:${serverPort}/sse`);
      logger.debug(
        ` -> Message posts: http://localhost:${serverPort}/messages?sessionId=<sessionId>`
      );
    });
  } else {
    // This case should ideally not be hit due to validation in config.ts,
    // but kept as a safeguard.
    logger.error(`Unsupported transport type: ${transportType}`);
    process.exit(1);
  }
}

// Graceful shutdown handler
const shutdown = async () => {
  logger.info('Shutting down MCP server...');
  try {
    logger.info('Server shutdown initiated (no explicit dispose needed).');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during server shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server only if this script is run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  startServer().catch((error) => {
    logger.error({ err: error }, 'Failed to start MCP server');
    process.exit(1);
  });
}

// Export server, startServer, and handlers for testing
export {
  server,
  startServer,
  handleGreetTool /*, handleWelcomeResource, handleSummarizePrompt */,
}; // Comment out handlers for now
