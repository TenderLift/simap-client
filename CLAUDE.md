# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm build` - Build the library (ESM + CJS bundles with TypeScript declarations)
- `pnpm typecheck` - Type check with TypeScript (no emit)
- `pnpm gen` - Generate client code from OpenAPI specification

### Testing
- `pnpm test` - Run all test suites (Node, Workers, E2E)
- `pnpm test:node` - Run Node.js tests only
- `pnpm test:workers` - Run Cloudflare Workers tests (Miniflare)
- `pnpm test:e2e` - Run E2E tests against production SIMAP API
- `pnpm test:sdk` - Run minimal SDK tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:types` - Test TypeScript type definitions

### Publishing
- `pnpm prepublishOnly` - Pre-publish hook (runs typecheck and build)

## Architecture

### Project Structure
This is an auto-generated TypeScript client for the SIMAP (Swiss Public Procurement) API. The client is generated from the official OpenAPI specification using `@hey-api/openapi-ts`.

### Core Components

1. **Generated Client** (`src/generated/`)
   - Auto-generated from SIMAP OpenAPI spec
   - Contains all API methods, types, and client configuration
   - Do not manually edit files in this directory

2. **Main Export** (`src/index.ts`)
   - Re-exports generated client and SDK methods
   - Adds helper utilities: `withAuth`, `HttpError`, `ensureOk`
   - Entry point for the npm package

3. **Build Configuration**
   - Uses `tsup` for bundling (ESM + CJS output)
   - Platform target: browser (for edge compatibility)
   - Bundles all generated code together
   - No external dependencies bundled

### Key Design Decisions

1. **Edge-Compatible**: Uses Fetch API, no Node-specific APIs
2. **Multi-Runtime Support**: Works in Node.js 18+, Cloudflare Workers, Vercel/Netlify Edge
3. **Browser Limitation**: Direct browser usage not supported due to CORS - requires proxy
4. **Generated Code Committed**: Generated files are committed to avoid generation at install time

### Testing Strategy

1. **Workers Tests** (`*.worker.test.ts`): Run in Miniflare/workerd environment with MSW mocks
2. **Node Tests** (`*.test.ts`): Standard Node.js environment tests
3. **E2E Tests** (`simap-api.e2e.test.ts`): Live API integration tests against production SIMAP

### API Client Usage

```typescript
import { client } from './generated/client.gen';
import { listCantons, getPublicProjectSearch } from './generated/sdk.gen';

// Configure client
client.setConfig({
  baseUrl: 'https://www.simap.ch/api',
  headers: { 'Authorization': 'Bearer token' }
});

// Use SDK methods
const cantons = await listCantons();
const projects = await getPublicProjectSearch({ 
  query: { orderAddressCantons: ['TI'] }
});
```

## Important Notes

- The client is auto-generated - do not modify files in `src/generated/`
- To update the client, modify the OpenAPI spec URL in `openapi-ts.config.ts` and run `pnpm gen`
- The package is scoped under `@tenderlift` organization on npm
- Browser usage requires a CORS proxy as SIMAP API doesn't send CORS headers
- All tests use MSW for HTTP mocking except E2E tests which hit the real API