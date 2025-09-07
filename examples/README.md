# SIMAP Client Examples

This directory contains practical examples demonstrating how to use the `@tenderlift/simap-client` library.

## Prerequisites

Before running these examples, make sure you have:

1. Node.js 20+ installed
2. The library installed: `npm install @tenderlift/simap-client`

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)
Demonstrates the simplest way to use the client:
- Client configuration
- Fetching cantons
- Fetching countries
- Basic error handling

```bash
npx tsx basic-usage.ts
```

### 2. Search Projects (`search-projects.ts`)
Shows how to search for procurement projects:
- Searching with filters (canton, keywords, date range)
- Fetching project details by ID
- Implementing pagination
- Working with search results

```bash
npx tsx search-projects.ts
```

### 3. Reference Data (`reference-data.ts`)
Demonstrates fetching various reference data:
- Swiss cantons with NUTS codes
- Countries with ISO codes
- Available languages
- Activity types
- CPV codes (Common Procurement Vocabulary)
- Searching CPV codes

```bash
npx tsx reference-data.ts
```

### 4. Error Handling (`error-handling.ts`)
Comprehensive error handling examples:
- Basic try-catch patterns
- Using the `HttpError` class
- Using the `ensureOk` helper
- Implementing retry logic with exponential backoff
- Graceful degradation strategies
- Handling specific HTTP status codes

```bash
npx tsx error-handling.ts
```

## Running the Examples

### Option 1: Using tsx (recommended)
```bash
# Install tsx globally
npm install -g tsx

# Run an example
tsx basic-usage.ts
```

### Option 2: Using ts-node
```bash
# Install ts-node and TypeScript
npm install -g ts-node typescript

# Run an example
ts-node basic-usage.ts
```

### Option 3: Compile and run
```bash
# Compile TypeScript
npx tsc basic-usage.ts

# Run JavaScript
node basic-usage.js
```

## Environment Configuration

The examples use the public SIMAP API at `https://www.simap.ch/api`. No authentication is required for public endpoints.

If you have an API token, you can set it in the client configuration:

```typescript
client.setConfig({
  baseUrl: 'https://www.simap.ch/api',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

## Common Patterns

### Client Configuration
```typescript
import { client } from '@tenderlift/simap-client';

client.setConfig({
  baseUrl: 'https://www.simap.ch/api',
  // Optional: Add authentication
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### Error Handling
```typescript
const result = await getPublicProjectSearch({ query: {} });

if (result.error) {
  console.error('API error:', result.error);
  console.log('Status:', result.response.status);
} else if (result.data) {
  console.log('Success:', result.data);
}
```

### Using TypeScript Types
```typescript
import type { Canton, Project, CpvCode } from '@tenderlift/simap-client';

function processProject(project: Project) {
  // TypeScript ensures type safety
  console.log(project.title);
  console.log(project.orderAddress?.canton);
}
```

## API Rate Limits

The SIMAP API may have rate limits. If you encounter 429 errors:
1. Check the `Retry-After` header for wait time
2. Implement exponential backoff (see error-handling.ts)
3. Reduce request frequency
4. Cache responses when possible

## Further Resources

- [SIMAP API Documentation](https://www.simap.ch/api-doc/)
- [OpenAPI Specification](https://www.simap.ch/api/specifications/simap.yaml)
- [Library Documentation](https://github.com/tenderlift/simap-client)

## License

These examples are part of the @tenderlift/simap-client library and are licensed under the MIT License.