# Contributing to MCP Server Template

Thank you for considering contributing to the MCP Server Template! This document outlines the process for contributing to this project.

## Code of Conduct

Please follow standard open-source etiquette when interacting with the project and community. Be respectful and constructive in your communications.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/yourusername/mcp-server-template/issues)
- Use the bug report template when creating a new issue
- Include as much detail as possible: steps to reproduce, expected behavior, actual behavior, and environment details

### Suggesting Features

- Check if the feature has already been suggested in the [Issues](https://github.com/yourusername/mcp-server-template/issues)
- Use the feature request template when creating a new issue
- Clearly describe the problem and solution, with examples if possible

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run the tests (`npm test`)
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Create a new Pull Request

## Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file from `.env.example`
4. Run the development server with `npm run dev`
5. Run tests with `npm test`

## Style Guidelines

- Follow the existing code style (enforced by ESLint and Prettier)
- Write clear, descriptive commit messages
- Include tests for new features and bug fixes
- Update documentation as needed

## Additional Notes

### MCP Protocol Considerations

When extending the server with new capabilities, remember to:

- Follow the MCP protocol specification
- Ensure proper JSON-RPC formatting for all messages
- Write logs to stderr when in stdio mode
- Be mindful of tool naming conventions and prefixing 