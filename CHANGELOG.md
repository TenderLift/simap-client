# Changelog

## 0.2.0

### Minor Changes

- f87d56d: Update SIMAP OpenAPI spec and regenerate client

## 0.1.0

### Minor Changes

- 61a3ebd: Initial release of the SIMAP TypeScript client library

  ## Features

  - 🚀 Full TypeScript support with comprehensive type definitions
  - 🌐 Multi-runtime compatibility (Node.js 18+, Cloudflare Workers, Edge environments)
  - 📦 Lightweight bundle size (<10KB gzipped)
  - 🔄 Auto-generated from official SIMAP OpenAPI specification
  - 🛡️ Built-in error handling with typed error responses
  - 🔑 Simple authentication helper functions
  - ✅ Comprehensive test coverage (85+ tests)

  ## Endpoints Supported

  - Canton/region reference data
  - Country and language lookups
  - Project search and filtering
  - Publication details retrieval
  - CPV/CPC/BKP code classifications

  ## Quality

  - XO linting with Prettier formatting
  - Pre-commit hooks with Lefthook
  - Automated CI/CD with GitHub Actions
  - Daily OpenAPI spec drift detection
  - Bundle size monitoring

  This initial release provides a solid foundation for interacting with the SIMAP API in TypeScript projects.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-01-07

### 🎉 Initial Release

First public release of the SIMAP TypeScript client library.

### Features

- **Full TypeScript Support**: Comprehensive type definitions for all API endpoints and responses
- **Multi-Runtime Compatibility**: Works with Node.js 18+, Cloudflare Workers, Vercel/Netlify Edge, and other Fetch API compatible environments
- **Auto-Generated Client**: Generated from the official SIMAP OpenAPI specification for accuracy and completeness
- **Lightweight Bundle**: Optimized for size - 5.3KB (ESM) / 7.28KB (CJS) gzipped
- **Built-in Error Handling**: `HttpError` class and `ensureOk` utility for robust error management
- **Authentication Helpers**: `withAuth` utility for easy token-based authentication
- **Comprehensive Testing**: 67 tests covering Node.js and Worker environments

### Supported Endpoints

#### Reference Data

- Canton/region listings
- Country and language lookups
- TED activity codes
- Selection criteria

#### Project Operations

- Public project search with filtering
- Project header retrieval by ID
- Publication details access

#### Classification Systems

- CPV (Common Procurement Vocabulary) codes
- CPC (Central Product Classification) codes
- BKP (Swiss construction classification) codes
- NPK (Swiss standard position catalog) codes

### Developer Experience

- **Modern Build Setup**: ESM and CJS dual package with TypeScript declarations
- **Quality Assurance**: XO linting with Prettier formatting
- **Git Hooks**: Pre-commit checks with Lefthook
- **CI/CD Ready**: GitHub Actions workflows for testing and releases
- **Spec Drift Detection**: Daily automated checks for API specification changes
- **Bundle Size Monitoring**: Automated size checks to maintain small footprint

### Documentation

- Comprehensive README with usage examples
- TypeScript type definitions for IDE support
- API documentation for all available methods
- Troubleshooting guide for common issues

### Infrastructure

- MIT licensed
- Published to npm as `@tenderlift/simap-client`
- Source available on GitHub
- Automated release process with changesets

---

For more information, visit the [GitHub repository](https://github.com/tenderlift/simap-client).
