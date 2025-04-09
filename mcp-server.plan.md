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

## 3. Work plan

| Task ID | Description                                      | Estimated Effort | Status      | Notes                                                               |
| :------ | :----------------------------------------------- | :--------------- | :---------- | :------------------------------------------------------------------ |
| **P0**  | **Foundation setup**                             |                  |             |                                                                     |
| T01     | Initialize Node.js/TypeScript project (`npm init`) | S                | Done        | Setup `tsconfig.json`, basic project structure (src, dist, tests) |
| T02     | Add core dependencies (MCP SDK, zod, dotenv)     | S                | Done        |                                                                     |
| T03     | Setup linter & formatter (ESLint, Prettier)      | S                | Done        | Configure rules, add scripts to `package.json`                    |
| T04     | Setup testing framework (vitest)                 | S                | Done        | Basic configuration                                                 |
| **P1**  | **Core server implementation**                   |                  |             |                                                                     |
| T05     | Implement basic server structure using MCP SDK   | M                | Done        | Define main server class/entry point                              |
| T06     | Add stdio transport support                      | M                | Done        | Implement logic to run server over standard I/O                   |
| T07     | Add HTTP/SSE transport support                   | L                | Done        | Use Express and SSEServerTransport                                |
| T08     | Implement example `Tool` with zod validation     | M                | Done        | `greet` tool added                                                |
| T09     | Implement example `Resource`                     | S                | Done        | `welcome-message` resource added                                  |
| T10     | Implement example `Prompt`                       | S                | Done        | `summarize-topic` prompt added                                  |
| **P2**  | **Supporting components**                        |                  |             |                                                                     |
| T11     | Implement configuration loading (env vars, file) | M                | Done        | Use `dotenv` and `src/config.ts` (Note: Only env vars implemented) |
| T12     | Integrate structured logging                     | M                | Done        | Added `pino` and `src/logger.ts`                                  |
| T13     | Implement consistent error handling              | M                | Done        | Added `src/errors.ts` and basic `try/catch` in tool               |
| **P3**  | **Containerization & Documentation**             |                  |             |                                                                     |
| T14     | Create `Dockerfile` and `.dockerignore`          | M                | Done        | Multi-stage build for smaller image size                          |
| T15     | Write initial `README.md`                        | L                | Done        | Cover setup, config, running, extension                           |
| **P4**  | **Testing & Refinement**                         |                  |             |                                                                     |
| T16     | Add basic unit/integration tests                 | L                | Done        | Added tests for config and greet tool handler                     |
| T17     | Refine code, address lint/test issues          | M                | Done        | Fixed lint errors and failing config tests                        |
| T18     | Finalize `README.md`                             | M                | Done        | Reviewed, fixed formatting, added LICENSE file                    |

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
