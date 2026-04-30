---
"@tenderlift/simap-client": minor
---

Fix advance_notice discriminator narrowing (issue #30) and bump all devDependencies

- Fix `PublicationAdvanceNoticeDetailDiscriminator` and 3 siblings producing `never` when narrowed on `type === 'advance_notice'`
- Postprocessor regex now catches discriminant literals with numeric suffixes
- Bump TypeScript 5→6, Vitest 3→4, openapi-ts 0.82→0.97, Cloudflare pool-workers 0.12→0.15
- Minimum Node version bumped from 20 to 22
