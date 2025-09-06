# @tenderlift/simap-api-client

TypeScript client for the SIMAP (Swiss Public Procurement) API, auto-generated from [the official OpenAPI specification](https://www.simap.ch/api/specifications/simap.yaml).

## Installation

```bash
npm install @tenderlift/simap-api-client
# or
pnpm add @tenderlift/simap-api-client
```

## What works (and what doesn’t)

- ✅ **Server runtimes**: Node.js 18+, Cloudflare Workers, Vercel/Netlify Edge (Fetch API compatible).

- ❌ **Direct browser usage**: **Not supported** against simap.ch because the upstream API does not send CORS headers.

> If you want to call the API from a browser app, you **must** route requests through your own proxy (dev server proxy or a tiny edge/worker proxy) and point the client at that proxy. This package does not ship a proxy.

### Why

SIMAP’s API does not include `Access-Control-Allow-Origin`, so browsers block cross-origin requests. Server/edge environments are unaffected.

## Quick start (server/edge)

```ts
import { client, listCantons } from '@tenderlift/simap-api-client';

// Default base is the SIMAP upstream. Configure headers if you need them.
client.setConfig({
  baseUrl: 'https://www.simap.ch/api',
  headers: {
    // Add authentication if needed
    // 'Authorization': `Bearer <token>`
  },
});

const res = await listCantons();
console.log(res.data);
```

### Error Handling

```typescript
import { ensureOk } from '@tenderlift/simap-api-client';

try {
  const response = await listCantons();
  const data = ensureOk(response); // Throws if response is not ok
  console.log(data);
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP Error ${error.status}:`, error.body);
  }
}
```

### Authentication Helper

```typescript
import { withAuth } from '@tenderlift/simap-api-client';

const authInit = withAuth({ token: 'your-token' })();
const response = await client.get('/protected-endpoint', { init: authInit });
```

## Browser usage (via your proxy)

This package can be used in browser apps only when you send requests through your proxy (e.g., Vite dev proxy during development, and a reverse-proxy endpoint you host in production). Point the client at the proxy base URL, e.g. `/simap`.

- Vite proxy docs: https://vitejs.dev/config/server-options.html#server-proxy
- Cloudflare Workers CORS/proxy example: https://developers.cloudflare.com/workers/examples/cors-header-proxy/

> No proxy code is included here; follow the docs above and set your proxy URL as the client baseUrl in your app.

## Friendly runtime guard

To prevent confusion, the client can throw a clear error when it detects browser usage targeting the upstream domain. If you haven’t enabled this yet, add something like the following to your entry:

```ts
// In your client factory / init (simplified example)
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const DEFAULT_BASE = 'https://www.simap.ch';

export function assertRuntime(baseUrl: string) {
  if (isBrowser && baseUrl.startsWith(DEFAULT_BASE)) {
    throw new Error(
      '[simap-api-client] Browser usage requires a proxy because simap.ch does not send CORS headers. ' +
        'Set baseUrl to your proxy (e.g. "/simap"). See README: Browser usage.',
    );
  }
}
```

Call `assertRuntime(baseUrl)` as part of your client setup.

## TypeScript

All request/response models are fully typed, generated from the SIMAP OpenAPI schema.

## Testing

We ship two test suites:

- **Workers runtime tests** (Vitest + Miniflare): exercise the client **inside workerd** with **mocked outbound requests**. Fast, deterministic, CI-friendly.
- **Node tests**: small unit checks (e.g., runtime guard).

### What these tests cover

- **Workers compatibility** (no Node-only APIs).
- **Request construction**: paths, methods, headers, query params.
- **Response handling**: JSON decoding, typing, basic mapping.
- **Error paths**: 4xx/5xx, network failures, timeouts/retries (where implemented).
- **Client behavior**: cursors/pagination and any helpers.
- **Runtime guard**: throws a clear message if you try to hit `simap.ch` from a browser.

### What they don’t cover

- **Live SIMAP availability or performance** (no real network calls by default).
- **Spec drift** on the SIMAP side (mocks pin the contract we expect).
- **Auth/infrastructure** details outside this package.
- **CORS/proxy configuration** for browser apps (you must provide your own proxy).

### How to run

- Workers (Miniflare): `pnpm run test:workers`
- Node: `pnpm run test:node`
- E2E against production: `pnpm run test:e2e`

### E2E Tests

The package includes end-to-end tests that validate the client against the SIMAP production API:

- **Coverage**: Tests search functionality, pagination, filtering by canton/date/type, and error handling
- **Focus**: Validates Ticino (TI) canton project searches with real API responses
- **Requirements**: Internet connection to reach `https://www.simap.ch/api`

## Compatibility matrix

- Node 18+: ✅
- Cloudflare Workers / Workerd: ✅
- Vercel/Netlify Edge: ✅
- Browsers (direct to simap.ch): ❌ (requires your proxy; see above)

## Contributing

This is an auto-generated client. To report issues or suggest improvements:

1. Check if the issue is with the SIMAP API itself
2. For client generation issues, please reach out to `support@tenderlift.ch`
3. For API issues, contact SIMAP support

## Links

- [SIMAP Portal](https://www.simap.ch)
- [SIMAP API Documentation](https://www.simap.ch/api/specifications/simap.yaml)
- [TenderLift](https://tenderlift.ch)
