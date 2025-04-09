# MCP Server Boilerplate (TypeScript)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A well-structured, maintainable, and extensible boilerplate project for building Model Context Protocol (MCP) servers using TypeScript. This boilerplate aims to accelerate development, promote consistency, and incorporate best practices for creating MCP integrations.

## Features

- **TypeScript:** Modern, type-safe JavaScript.
- **MCP SDK:** Uses the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk).
- **Focused Implementation:** Streamlined with stdio transport support for simplicity and reliability.
- **Example Primitives:** Includes basic examples for:
  - Tools: `greet` (greeting with configurable prefix) and `add` (simple calculator)
  - Resources: `welcome` (welcome message resource)
  - Prompts: `summarize` (topic summarization prompt)
- **Configuration:** Loads configuration from `.env` files and environment variables (`src/config.ts`).
- **Validation:** Uses `zod` for robust argument validation in primitives.
- **Structured Logging:** Uses `pino` for structured JSON logging (`src/logger.ts`). Pretty-printed logs in development.
- **Error Handling:** Custom error classes (`src/errors.ts`) and consistent `try/catch` patterns in all handlers.
- **Containerization:** Multi-stage `Dockerfile` for creating optimized production images.
- **Linting/Formatting:** Configured with ESLint and Prettier.
- **Testing:** Setup with Vitest. Includes example tests for configuration loading (`tests/config.test.ts`) and the `greet` tool handler (`tests/greet.test.ts`).

## Prerequisites

- Node.js (v18 or later recommended)
- npm (usually included with Node.js)
- Docker (optional, for running in a container)

## Setup and Installation

1.  **Clone the repository (or use as a template):**

    ```bash
    # If you cloned it
    git clone <repository-url>
    cd mcp-server-boilerplate
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment (Optional):**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file to set your desired configuration (see [Configuration](#configuration) section).

## Configuration

Configuration is managed via environment variables, which can be loaded from a `.env` file for local development.

- `LOG_LEVEL`: The minimum level for logging (e.g., `trace`, `debug`, `info`, `warn`, `error`, `fatal`). (Default: `info`).
- `NODE_ENV`: Set to `production` for optimized builds and standard JSON logs. Defaults to `development` (enables pretty logs).
- `CUSTOM_GREETING_PREFIX`: Optional prefix for the greeting tool (e.g., "👋 "). Default is empty.

## Running the Server

### Development Mode (with Hot-Reload and Pretty Logs)

This command uses `tsx` to run the TypeScript code directly and pipes the output through `pino-pretty`.

```bash
npm run dev
```

_Note: The `dev` script requires `pino-pretty` to be installed (`npm install --save-dev pino-pretty`)._

- Logs will be pretty-printed to the console.

### Production Mode (Compiled JavaScript)

1.  **Build the TypeScript code:**

    ```bash
    npm run build
    ```

    This compiles the code into the `dist/` directory.

2.  **Run the server:**
    ```bash
    # Example: Set custom greeting prefix with emoji
    set CUSTOM_GREETING_PREFIX=👋 
    set NODE_ENV=production
    npm start
    ```
    _Logs will be in JSON format._

### Running with Docker

1.  **Build the Docker image:**

    ```bash
    docker build -t mcp-server-boilerplate .
    ```

2.  **Run the container:**

    ```bash
    # Run with stdio transport 
    # (Needs an interactive terminal)
    docker run -i --rm --name mcp-server-stdio mcp-server-boilerplate
    ```

    - Adjust environment variables (`-e`) as needed.

## Extending the Boilerplate

1.  **Adding Tools:**

    - Define a Zod schema for the arguments in `src/index.ts` (or a separate `src/tools/` directory).
    - Use `server.tool(name, schemaDefinition, handler)`.
    - Implement the handler logic, potentially using custom errors from `src/errors.ts` for consistency.
    - **IMPORTANT:** Register tools with simple names only (e.g., "add", not "mcp_minimal_add"). Cursor automatically applies prefixing for AI tool calls.

2.  **Adding Resources:**

    - For static resources: `server.resource(name, uri, metadata, handler)`.
    - For dynamic resources: Define a `ResourceTemplate` and use `server.resource(name, template, metadata, handler)`.
    - Implement the handler logic.

3.  **Adding Prompts:**

    - Define a Zod schema for the arguments.
    - Use `server.prompt(name, schemaDefinition, handler)`.
    - Implement the handler logic to return the desired message structure.

4.  **Adding Configuration:**
    - Add new environment variables to `.env.example`.
    - Read and export the validated value from `src/config.ts`.

## MCP Tool Invocation

When working with MCP tools, it's important to understand how they're invoked:

1. **AI Tool Invocation:** MCP tools are designed to be called by the AI assistant, not directly by users. The AI can call tools directly using their prefixed name.

2. **Tool Naming:**

   - Register tools with simple names (e.g., "add")
   - The AI will see tools with prefixed names (e.g., "mcp_mcp_minimal_add")
   - Do not register tools with prefixed names, as this creates duplication

3. **Logging Considerations:**

   - When running in stdio mode, all logging must go to stderr, never stdout
   - Stdout is strictly reserved for JSON-RPC messages
   - Using console.log() will break the JSON-RPC protocol - use a custom logger that writes to stderr

4. **User Interface:**
   - Users cannot directly invoke MCP tools in the chat interface
   - The AI assistant acts as the intermediary to invoke tools on behalf of the user

## Common Issues

Based on our experience developing this boilerplate, here are some common issues to be aware of:

1. **JSON-RPC Protocol Issues:**
   - Any non-JSON-RPC messages (like console.log output) sent to stdout will break the stdio transport mechanism. All debugging logs MUST be written to stderr instead.
   - Only valid JSON-RPC messages should be sent to stdout in stdio mode.

2. **Tool Name Prefixing:** 
   - Cursor automatically prefixes tool names for AI assistant calls. For example, if your server is named "mcp_minimal" and you register a tool named "add", the AI will call it as "mcp_mcp_minimal_add".
   - Avoid registering tools with both simple and prefixed names as this creates duplicate entries in the AI's available tools.

3. **MCP Tool Invocation:**
   - MCP tools are designed to be called by the AI assistant, not directly by users in chat. Users cannot invoke MCP tools using "@Tool" syntax in the chat interface.
   - The AI automatically discovers registered tools and can call them without user configuration.

## Client Configuration Examples

Here are examples of how to configure a client like Cursor to connect to this server.

### Connecting via Stdio (Recommended for Local Development)

This method uses Cursor's `mcp.json` file (typically `~/.cursor/mcp.json` on Linux/macOS or `C:\Users\<username>\.cursor\mcp.json` on Windows).

1.  Ensure you have run `npm run build` to create the `dist/index.js` file.
2.  Add a script to your `package.json` to explicitly run the compiled stdio server:
    ```json
    "scripts": {
      // ... other scripts
      "start:stdio": "cross-env NODE_ENV=production node dist/index.js --stdio"
    }
    ```
3.  Install `cross-env` if you haven't already: `npm install --save-dev cross-env`.
4.  Configure the server in `mcp.json` (ensure no JSON comments `//` exist in the file):

    ```json
    {
      "mcpServers": {
        "mcp_minimal": {
          "displayName": "MCP Minimal",
          "command": "node",
          "args": [
            "C:\\path\\to\\your\\project\\dist\\index.js",
            "--stdio"
          ],
          "env": {
            "NODE_ENV": "production"
          },
          "enabled": true
        }
      }
    }
    ```

    - **Important:** Replace `"C:\\path\\to\\your\\project\\dist\\index.js"` with the correct **absolute path** to the `dist/index.js` file in _your_ project directory. Use double backslashes (`\\`) as path separators on Windows.
    - This configuration directly calls `node` with the absolute script path, bypassing potential issues with `npm` and relative paths when launched by Cursor.

## Basic Security Considerations

- **Input Validation:** Zod schemas are used for basic validation. Ensure schemas are strict enough for your needs.
- **Error Handling:** Avoid leaking sensitive information in error messages sent back to the client. The current setup throws errors, which the SDK translates; review the SDK's error formatting.
- **Resource Access:** Implement authorization checks within resource/tool handlers if they access sensitive data or perform restricted actions (currently not implemented).
- **Dependencies:** Regularly audit dependencies for vulnerabilities (`npm audit`).
- **Container Security:** The `Dockerfile` uses a non-root user. Keep the base image updated.

## Testing

- Run tests using Vitest:
  ```bash
  npm test
  ```
- Run tests in watch mode:
  ```bash
  npm run test:watch
  ```
- Generate coverage report:
  ```bash
  npm run coverage
  ```
- Add new test files in the `tests/` directory following the `*.test.ts` pattern.

## Linting and Formatting

- Check formatting: `npm run format`
- Apply formatting: `npm run format:fix`
- Run linter: `npm run lint`
- Fix linter errors: `npm run lint:fix`

## Limitations

MCP is a very new protocol and is still in active development. There are some known caveats to be aware of:

- **AI Model Compatibility:** The ability for the Cursor AI agent to automatically use or be prompted to use custom MCP tools can be **model-dependent**. Some models may have difficulty initiating calls to dynamically discovered tools even if they are listed correctly in the settings. Testing with different AI models within Cursor may be necessary if you encounter issues with AI tool invocation.
- **Tool Quantity:** Some MCP servers, or user's with many MCP servers active, may have many tools available for Cursor to use. Currently, Cursor will only send the first 40 tools to the Agent.
- **Remote Development:** Cursor directly communicates with MCP servers from your local machine, either directly through `stdio` or via the network using `sse`. Therefore, MCP servers may not work properly when accessing Cursor over SSH or other development environments. We are hoping to improve this in future releases.
- **MCP Resources:** MCP servers offer two main capabilities: tools and resources. Tools are available in Cursor today, and allow Cursor to execute the tools offered by an MCP server, and use the output in it's further steps. However, resources are not yet supported in Cursor. We are hoping to add resource support in future releases.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
