# Contributing to SIMAP TypeScript Client

Thank you for your interest in contributing to the SIMAP TypeScript Client! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 10.14.0 or higher

### Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/tenderlift/simap-client.git
cd simap-client
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

4. Run tests:
```bash
pnpm test
```

## Development Workflow

### Available Scripts

- `pnpm build` - Build the library
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run XO linter
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm test` - Run all tests
- `pnpm test:node` - Run Node.js tests only
- `pnpm test:workers` - Run Cloudflare Workers tests only
- `pnpm test:e2e` - Run E2E tests against live API
- `pnpm size` - Check bundle size
- `pnpm gen` - Regenerate client from OpenAPI spec

### Making Changes

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our coding standards

3. Write or update tests as needed

4. Ensure all checks pass:
```bash
pnpm typecheck
pnpm lint
pnpm test
```

5. Create a changeset for your changes:
```bash
pnpm changeset
```

6. Commit your changes following conventional commits:
```bash
git commit -m "feat: add new feature"
```

### Commit Message Format

We use conventional commits. Please format your commit messages as:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test changes
- `refactor:` - Code refactoring

## Pull Request Process

1. Ensure your branch is up to date with main
2. Create a pull request with a clear title and description
3. Link any related issues
4. Wait for review and address feedback
5. Once approved, your PR will be merged

## Testing

### Test Structure

- `test/unit/` - Unit tests for utilities
- `test/integration/` - Integration tests with MSW mocks
- `test/*.worker.test.ts` - Cloudflare Workers environment tests
- `test/simap-api.e2e.test.ts` - Live API tests

### Writing Tests

- Write tests for all new functionality
- Maintain test coverage above 80%
- Use descriptive test names
- Mock external dependencies appropriately

## Code Generation

The client is auto-generated from the SIMAP OpenAPI specification:

1. The spec is stored in `spec/simap.yaml`
2. To update the spec: `npx tsx scripts/fetch-spec.ts`
3. To regenerate code: `pnpm gen`
4. Never manually edit files in `src/generated/`

## Versioning

We use [changesets](https://github.com/changesets/changesets) for version management:

1. Create a changeset for your changes: `pnpm changeset`
2. Select the appropriate version bump (patch/minor/major)
3. Write a clear description for the changelog

## Questions?

Feel free to open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.