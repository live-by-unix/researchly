# Contributing to Research.ly

Thank you for your interest in contributing to Research.ly!

## Code of Conduct

Be respectful, constructive, and inclusive. We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Feature description
   - Use case
   - Proposed implementation (if known)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Build: `npm run build:frontend && npm run build:worker`
7. Commit with clear message
8. Push to your fork
9. Create pull request

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Example:
```
feat: add source filtering by domain
```

## Development Workflow

### Setup

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for setup instructions.

### Testing

Run tests before committing:

```bash
npm test
```

Ensure all tests pass.

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and small

### Review Process

1. Automated checks run on PR
2. Maintainers review code
3. Address feedback
4. Once approved, PR is merged

## Project Structure

- `frontend/`: React application
- `worker/`: Cloudflare Worker
- `shared/`: Shared TypeScript types
- `docs/`: Documentation

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Areas for Contribution

- Additional source filters
- Enhanced export formats
- Performance optimizations
- UI/UX improvements
- Additional test coverage
- Documentation improvements
- Accessibility enhancements

## Questions?

Open an issue or discussion for questions.
