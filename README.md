# MCP Server Boilerplate (TypeScript)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A well-structured, maintainable, and extensible boilerplate project for building Model Context Protocol (MCP) servers using TypeScript. This boilerplate aims to accelerate development, promote consistency, and incorporate best practices for creating MCP integrations.

## Features

- **TypeScript:** Modern, type-safe JavaScript.
- **MCP SDK:** Uses the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk).
- **Dual Transport:** Supports both `stdio` and `HTTP/SSE` transports, configurable via environment variables.
- **Example Primitives:** Includes basic examples for a Tool (`greet`), a Resource (`welcome-message`), and a Prompt (`summarize-topic`).
- **Configuration:** Loads configuration from `.env` files and environment variables (`src/config.ts`).
- **Validation:** Uses `zod` for robust argument validation in primitives.
- **Structured Logging:** Uses `pino` for structured JSON logging (`src/logger.ts`). Pretty-printed logs in development.
- **Error Handling:** Basic custom error classes (`src/errors.ts`) and `try/catch` in tool example.
- **Containerization:** Multi-stage `Dockerfile` for creating optimized production images.
- **Linting/Formatting:** Configured with ESLint and Prettier.
- **Testing:** Setup with Vitest (`vitest.config.ts`). Includes example tests for configuration loading (`tests/config.test.ts`) and the `greet` tool handler (`tests/greet.test.ts`).

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

- `MCP_TRANSPORT`: Specifies the communication transport.
  - `stdio` (Default): Uses standard input/output.
  - `http`: Uses HTTP with Server-Sent Events (SSE).
- `MCP_PORT`: The port number for the HTTP/SSE transport (Default: `3001`). Only used if `MCP_TRANSPORT=http`.
- `LOG_LEVEL`: The minimum level for logging (e.g., `trace`, `debug`, `info`, `warn`, `error`, `fatal`). (Default: `info`).
- `NODE_ENV`: Set to `production` for optimized builds and standard JSON logs. Defaults to `development` (enables pretty logs).

## Running the Server

### Development Mode (with Hot-Reload and Pretty Logs)

This command uses `tsx` to run the TypeScript code directly and pipes the output through `pino-pretty`.

```bash
npm run dev
```

_Note: Ensure your `.env` file is configured correctly for the desired transport._

- Logs will be pretty-printed to the console.

### Production Mode (Compiled JavaScript)

1.  **Build the TypeScript code:**

    ```bash
    npm run build
    ```

    This compiles the code into the `dist/` directory.

2.  **Run the server:**
    ```bash
    # Example: Run with HTTP transport on port 4000
    export MCP_TRANSPORT=http
    export MCP_PORT=4000
    export NODE_ENV=production
    npm start
    ```
    _Or on Windows (cmd.exe):_
    ```cmd
    set MCP_TRANSPORT=http
    set MCP_PORT=4000
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
    # Example 1: Run with stdio transport
    # (Needs an interactive terminal)
    docker run -i --rm --name mcp-server-stdio mcp-server-boilerplate

    # Example 2: Run with HTTP transport, exposing port 3001
    docker run -d --rm --name mcp-server-http \
      -p 3001:3001 \
      -e MCP_TRANSPORT=http \
      -e MCP_PORT=3001 \
      -e NODE_ENV=production \
      mcp-server-boilerplate
    ```

    - Adjust environment variables (`-e`) and port mappings (`-p`) as needed.

## Extending the Boilerplate

1.  **Adding Tools:**

    - Define a Zod schema for the arguments in `src/index.ts` (or a separate `src/tools/` directory).
    - Use `server.tool(name, schemaDefinition, handler)`.
    - Implement the handler logic, potentially using custom errors from `src/errors.ts` for consistency.

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

## Basic Security Considerations

- **Input Validation:** Zod schemas are used for basic validation. Ensure schemas are strict enough for your needs.
- **Error Handling:** Avoid leaking sensitive information in error messages sent back to the client. The current setup throws errors, which the SDK translates; review the SDK's error formatting.
- **Resource Access:** Implement authorization checks within resource/tool handlers if they access sensitive data or perform restricted actions (currently not implemented).
- **Dependencies:** Regularly audit dependencies for vulnerabilities (`npm audit`).
- **Container Security:** The `Dockerfile` uses a non-root user. Keep the base image updated.
- **HTTP Transport:** If exposing the HTTP transport externally, consider adding authentication/authorization middleware (e.g., API keys, OAuth) and HTTPS termination (e.g., via a reverse proxy like Nginx or Caddy).

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

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
