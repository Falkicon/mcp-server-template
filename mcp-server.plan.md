# MCP server boilerplate specification and work plan

## 1. Introduction

### 1.1. Goal

To create a well-structured, maintainable, and extensible boilerplate project for building Model Context Protocol (MCP) servers using TypeScript. This boilerplate aims to accelerate development, promote consistency, and incorporate best practices identified in the research phase.

### 1.2. Background

The `mcp-server.research.md` document highlights the increasing importance of MCP for integrating AI with external tools and data. It outlines best practices regarding security, configuration, deployment (especially using containers), and the utility of SDKs (like the TypeScript SDK) for simplifying development. This boilerplate will provide a practical starting point based on those findings.

### 1.3. Target audience

Developers (initially internal, potentially broader) needing to create new MCP servers. Assumes familiarity with TypeScript and basic server concepts.

## 2. Specification

### 2.1. Core requirements

- **Language:** TypeScript
- **Framework/SDK:** Utilize the official Anthropic TypeScript MCP SDK.
- **Transport:** Support both standard input/output (`stdio`) and HTTP with Server-Sent Events (SSE) transport mechanisms, configurable at runtime.
- **Primitives:** Include basic, extensible examples for:
  - One `Tool`
  - One `Resource`
  - One `Prompt`
- **Configuration:**
  - Primarily via environment variables (following 12-factor app principles).
  - Optionally load configuration from a JSON or YAML file.
  - Document all configuration options clearly.
- **Validation:** Implement basic input validation for tool arguments using `zod`.
- **Error handling:** Establish a consistent error handling strategy (e.g., custom error classes, potentially a Result pattern).
- **Logging:** Integrate a simple, structured logging mechanism (e.g., `pino` or similar).
- **Containerization:** Provide a `Dockerfile` for building a production-ready container image. Include a `.dockerignore` file.
- **Documentation:** A comprehensive `README.md` covering:
  - Project overview and purpose.
  - Setup and installation instructions.
  - Configuration details (environment variables, config files).
  - How to run the server (stdio, HTTP/SSE, Docker).
  - How to extend the boilerplate (adding new tools, resources, prompts).
  - Basic security considerations.
- **Testing:** Include a basic test setup (e.g., using `jest` or `vitest`) with example tests for the core functionality.
- **Linting/Formatting:** Integrate ESLint and Prettier for code quality and consistency.

### 2.2. Non-goals (Initial version)

- Advanced authentication/authorization mechanisms (e.g., OAuth).
- Specific cloud deployment templates (e.g., Terraform, CloudFormation, Cloudflare Workers setup).
- Complex CI/CD pipeline definitions.
- GUI management tools.
- Database integrations.

### 2.3. Common Issues and Solutions

#### 2.3.1 JSON-RPC Protocol Issues

- **Logging to stdout**: Any non-JSON-RPC messages (like console.log output) sent to stdout will break the stdio transport mechanism. All debugging logs MUST be written to stderr instead.
- **Tool Name Prefixing**: Cursor automatically prefixes tool names for AI assistant calls. For example, if your server is named "mcp_minimal" and you register a tool named "add", the AI will call it as "mcp_mcp_minimal_add".
- **Tool Duplication**: Avoid registering tools with both simple and prefixed names as this creates duplicate entries in the AI's available tools.

#### 2.3.2. MCP Tool Invocation

- **AI vs User**: MCP tools are designed to be called by the AI assistant, not directly by users in chat. Users cannot invoke MCP tools using "@Tool" syntax in the chat interface.
- **Tool Discovery**: The AI automatically discovers registered tools and can call them without user configuration.

## 3. Work plan

| Task ID | Description                                       | Estimated Effort | Status | Notes                                                                                |
| :------ | :------------------------------------------------ | :--------------- | :----- | :----------------------------------------------------------------------------------- |
| **P0**  | **Foundation setup**                              |                  |        | _Completed: npm init, TS, ESLint/Prettier, Vitest, core deps_                        |
| **P1**  | **Core server implementation**                    |                  |        | _Completed: SDK setup, stdio/http transports, example primitives_                    |
| **P2**  | **Supporting components**                         |                  |        | _Completed: Config (.env), Logger (pino), Errors (custom class)_                     |
| **P3**  | **Containerization & Documentation**              |                  |        | _Completed: Multi-stage Dockerfile, initial README.md_                               |
| **P4**  | **Testing & Refinement**                          |                  |        | _Completed: Basic tests (config, greet), lint/format fixes_                          |
| **P5**  | **Template Validation**                           |                  |        | _Verify template usability & functionality (Note: AI tool usage is model-dependent)_ |
| V01     | Test dev mode run (stdio & http)                  | S                | Done   | Use `npm run dev`, check logs (Installed `pino-pretty`)                              |
| V02     | Test prod mode run (stdio & http)                 | S                | Done   | Use `npm run build` + `npm start`, check logs                                        |
| V03     | Test Docker run (stdio & http)                    | M                | Done   | Use `docker build` + `docker run` (Note: `logs` needs review for detached)           |
| V04     | Test `greet` tool functionality                   | S                | Done   | Verified via AI prompt (Model Dependent)                                             |
| V05     | Test `welcome-message` resource                   | S                | Done   | Verified via AI prompt (Model Dependent)                                             |
| V06     | Test `summarize-topic` prompt                     | S                | Done   | Verified via AI prompt (Model Dependent)                                             |
| V07     | Test adding a new simple tool                     | M                | Done   | Added `add` tool, verified via AI prompt (Model Dependent)                           |
| V08     | Test adding a new simple resource                 | S                | Done   | Added `goodbye-message`, verified via AI prompt (Model Dependent)                    |
| V09     | Test adding a new config variable                 | S                | Done   | Added `CUSTOM_GREETING_PREFIX`, verified with emoji prefix in greet output           |
| V10     | Run unit tests (`npm test`)                        | S                | Done        | All tests pass after aligning function signatures           |
| V11     | Run linting/formatting checks                      | S                | Done        | All files now meet linting and formatting standards          |
| V12     | Review and update README.md                         | M                | Done   | Updated the README to reflect the current implementation, added a Common Issues section, removed references to HTTP/SSE transport, updated example configurations, fixed typos and clarified explanations |
| V13     | Fix tool duplication and naming issues              | S                | Done   | Removed redundant tool registrations, improved comments                              |
| V14     | Consolidate server logic and cleanup unused files   | M                | Done   | Merged minimal-server into index.ts, removed adapters/debug code                     |

### 3.1. Effort estimation key

- **S:** Small (<= 2 hours)
- **M:** Medium (2-4 hours)
- **L:** Large (4-8 hours)
- **XL:** Extra Large (> 8 hours)

## 4. Future considerations

- Integration with specific CI/CD platforms.
- Adding more sophisticated AuthN/AuthZ examples.
- Providing IaC templates (Terraform, etc.).
- Developing more complex example tools/resources.
- Exploring support for Streamable HTTP transport when SDK support matures.

This plan provides a starting point. We can adjust the scope, priorities, and details as needed. Let me know what you think!
