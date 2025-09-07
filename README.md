# @tenderlift/simap-client

[![npm version](https://img.shields.io/npm/v/@tenderlift/simap-client.svg)](https://www.npmjs.com/package/@tenderlift/simap-client)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/TenderLift/simap-client/tree/main/examples?file=basic-usage.ts&title=SIMAP%20Client%20Demo&terminal=start)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tenderlift/simap-client)](https://bundlephobia.com/package/@tenderlift/simap-client)

TypeScript client for the SIMAP (Swiss Public Procurement) API, auto-generated from [the official OpenAPI specification](https://www.simap.ch/api/specifications/simap.yaml).

> ⚠️ **Non-affiliation Notice**: This is an unofficial, open-source library for the SIMAP API. It is developed and maintained independently by TenderLift. While SIMAP has graciously approved the open-sourcing of this library, they do not control, endorse, or bear any responsibility for it. For official information, visit [simap.ch](https://www.simap.ch).

## Features

- **Full TypeScript support** with comprehensive type definitions
- **Multi-runtime compatible**: Node.js 20+, Cloudflare Workers, Vercel/Netlify Edge
- **Lightweight**: <10KB gzipped (5.3KB ESM, 7.28KB CJS)
- **Auto-generated** from official SIMAP OpenAPI specification
- **Built-in error handling** with typed error responses
- **Authentication helpers** for token-based auth
- **Well tested**: 67 tests across Node.js and Worker environments

## Installation

```bash
npm install @tenderlift/simap-client
# or
pnpm add @tenderlift/simap-client
# or
yarn add @tenderlift/simap-client
```

## Quick Start

### Basic Usage (Node.js/Edge)

```typescript
import { client, listCantons, getPublicProjectSearch } from '@tenderlift/simap-client';

// Configure the client (optional - defaults to SIMAP API)
client.setConfig({
  baseUrl: 'https://www.simap.ch/api',
  headers: {
    // Add authentication if needed
    // 'Authorization': `Bearer ${token}`
  },
});

// Fetch reference data
const cantons = await listCantons();
console.log(cantons.data); // List of Swiss cantons

// Search for projects
const projects = await getPublicProjectSearch({
  query: {
    orderAddressCantons: ['TI', 'GR'],
    search: 'construction'
  }
});
console.log(projects.data?.projects);
```

### Error Handling

```typescript
import { ensureOk, HttpError } from '@tenderlift/simap-client';

try {
  const response = await listCantons();
  const data = ensureOk(response); // Throws HttpError if response is not ok
  console.log(data);
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
    console.error('Error data:', error.data);
  }
}
```

### Authentication

```typescript
import { withAuth } from '@tenderlift/simap-client';

// Add authentication to all requests
const auth = { token: 'your-api-token' };
client.interceptors.request.use((request) => {
  return withAuth(auth)(request);
});
```

## Browser Support

❌ **Direct browser usage is not supported** because the SIMAP API does not send CORS headers.

If you need to use this client in a browser application, you must:
1. Set up a proxy server (your backend, edge function, or development server)
2. Route SIMAP API requests through your proxy
3. Configure the client to use your proxy URL

Example proxy setup with Vite:
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://www.simap.ch',
        changeOrigin: true,
      }
    }
  }
}
```

## API Documentation

### Available Endpoints

#### Reference Data
- `listCantons()` - Get all Swiss cantons
- `listCountries()` - Get all countries
- `listLanguages()` - Get supported languages
- `listActivities()` - Get TED activity codes
- `listCriteria()` - Get selection criteria

#### Project Search
- `getPublicProjectSearch(options)` - Search public procurement projects
- `getProjectHeaderById(options)` - Get project details by ID
- `getPublicationDetail(options)` - Get publication details

#### Classification Codes
- `listCPVCodes()` - Common Procurement Vocabulary codes
- `listCPCCodes()` - Central Product Classification codes
- `listBKPCodes()` - Swiss construction classification codes
- `listNPKCodes()` - Swiss standard position catalog codes

### Response Structure

All API methods return a response object with the following structure:

```typescript
interface ApiResponse<T> {
  data?: T;        // Response data (undefined on error)
  error?: unknown; // Error information
  response: Response; // Raw fetch Response object
}
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

### Scripts

- `pnpm build` - Build the library
- `pnpm test` - Run all tests
- `pnpm typecheck` - Type checking
- `pnpm lint` - Run linter
- `pnpm size` - Check bundle size

## Troubleshooting

### Common Issues

#### TypeScript Types Not Found
Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

#### Network Errors in Node.js
For Node.js versions before 20, you may need a fetch polyfill:
```bash
npm install node-fetch
```

#### Authentication Errors
Ensure your API token is valid and properly formatted in the Authorization header.

## License

MIT © [TenderLift](https://github.com/tenderlift)

See [LICENSE](LICENSE) file for details.

## Links

- [NPM Package](https://www.npmjs.com/package/@tenderlift/simap-client)
- [GitHub Repository](https://github.com/tenderlift/simap-client)
- [Issue Tracker](https://github.com/tenderlift/simap-client/issues)
- [SIMAP Official Site](https://www.simap.ch)
- [SIMAP API Documentation](https://www.simap.ch/api-doc/)

---

Built with ❤️ for the Swiss open-source community
