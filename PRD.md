# SIMAP TypeScript Client – PRD & Tech Spec (v1.0)

## 0) Context & Goals

You’re open‑sourcing a production‑grade TypeScript client for the **SIMAP OpenAPI**. The repo will be separate from TenderLift and distributed on npm under an organization scope. We prioritize:

* **Stability** (pinned spec; automated drift detection)
* **Type‑safety** (generated types + fetch client)
* **Edge compatibility** (no Node‑only APIs; ESM‑first)
* **DX** (great README, examples, tests, CI, semantic releases)
* **Governance** (license, contributing, CODEOWNERS, release rituals)

## 1) Outcomes & Success Criteria

**Primary outcomes**

* A public GitHub repo with a published npm package.
* Deterministic generation pipeline with the **spec committed** to the repo.
* CI that guarantees: buildable, tested, generated output up‑to‑date.
* A scheduled drift‑detection job that opens a PR on spec changes and notifies Slack.

**Success metrics**

* 100% CI pass on PRs; generated code up‑to‑date check enforced.
* Daily drift job reliability, with PRs created when upstream spec changes.
* > 90% endpoint coverage with MSW‑backed tests (success + error paths).
* <10KB runtime (gzipped) added by the client core (ex‑types).

## 2) Key Decisions (opinionated)

* **Generator**: `@hey-api/openapi-ts` (fetch client + types). Small, modern, ESM‑friendly.
* **Commit generated code**: ✅ Yes, to avoid consumers needing the generator at install time.
* **Bundler**: `tsup` producing **ESM + CJS**; types emitted; `sideEffects:false`.
* **Tests**: `vitest` + `msw` for HTTP; extra runtime test in **Miniflare** for Edge.
* **Spec management**: store a **pinned** `spec/simap.yaml` in repo. A **scheduled job** fetches latest and opens a PR if changed.
* **Versioning & changelog**: `changesets` with **manual approve & publish** via GitHub Actions; auto‑generated CHANGELOG.
* **Notifications**: Slack webhook primary; optional Telegram; optional email via SMTP action.
* **License**: **MIT** (simple, permissive). Add NOTICE and non‑affiliation disclaimer with SIMAP.
* **npm scope**: `@tenderlift/simap` (clear ownership; SIMAP approved open‑source, but scope stays TenderLift).

## 3) Repository Layout

```
simap-ts-client/
├─ .github/
│  └─ workflows/
│     ├─ ci.yml                 # PR/Push: lint, build, test, gen-check
│     ├─ drift.yml              # scheduled: fetch spec → diff → PR + notify
│     ├─ release.yml            # changesets: version & publish (manual)
│     └─ labels.yml             # repo labels (optional)
├─ scripts/
│  ├─ fetch-spec.ts             # download upstream YAML → spec/simap.upstream.yaml
│  ├─ normalize-spec.ts         # (optional) preprocess (refs, enums) → spec/simap.yaml
│  └─ check-generated-clean.ts  # fails if `pnpm gen` introduces diffs
├─ spec/
│  ├─ simap.yaml                # pinned, authoritative spec used for gen
│  └─ README.md                 # how to update/verify spec
├─ src/
│  ├─ gen/                      # generated files (committed)
│  ├─ runtime/                  # tiny fetch runtime helpers
│  │  └─ index.ts
│  ├─ index.ts                  # barrel re-exports
│  └─ errors.ts                 # typed HTTP errors & helpers
├─ test/
│  ├─ setup-msw.ts              # msw setupServer, lifecycle hooks
│  ├─ handlers/
│  │  ├─ projects.ts            # example handlers per resource
│  │  └─ ...
│  ├─ node/                     # vitest unit tests (Node)
│  │  └─ projects.test.ts
│  └─ workers/                  # runtime smoke with Miniflare
│     └─ runtime.test.ts
├─ examples/
│  ├─ node-basic.ts
│  └─ workers-basic.ts
├─ codegen.config.ts            # hey-api/openapi-ts config
├─ tsconfig.json
├─ tsup.config.ts
├─ vitest.config.ts
├─ .changeset/                  # changesets configuration + entries
├─ .editorconfig
├─ .npmrc
├─ .gitignore
├─ LICENSE
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
├─ SECURITY.md                  # report vulnerabilities
├─ README.md
└─ package.json
```

## 4) Public API Shape (developer‑facing)

```ts
import { createClient } from "@tenderlift/simap";

const simap = createClient({
  baseUrl: "https://api.simap.ch", // overridable for mocks
  headers: { "User-Agent": "@tenderlift/simap" }
});

// Typed request/response
const res = await simap.projects.list({ page: 1, size: 20 });
// res.data: Project[]

// Handling errors with a typed HttpError
try {
  await simap.projects.get({ id: "123" });
} catch (e) {
  if (isHttpError(e)) {
    console.error(e.status, e.body);
  }
}
```

**Notes**

* `createClient` is a thin wrapper around fetch with overridable `fetchImpl`, headers, and retry/timeout options.
* Export `types` for all schemas and operations.
* Never call Node‑specific APIs in client code.

## 5) Codegen (hey‑api/openapi‑ts)

**`codegen.config.ts` (minimal)**

```ts
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./spec/simap.yaml",
  output: {
    path: "./src/gen",
    // keep filenames stable for minimal diffs
    clean: true,
  },
  httpClient: {
    name: "fetch", // generate a fetch-based SDK
  },
  exportCore: false, // keep runtime minimal in our repo
  exportSchemas: true,
  exportServices: true,
  // optional name normalizers / enum strategies could be added here
});
```

**`package.json` scripts**

```json
{
  "scripts": {
    "gen": "heyapi -c codegen.config.ts",
    "build": "tsup src/index.ts --dts --format esm,cjs --clean",
    "lint": "eslint .",
    "test": "vitest run",
    "dev:test": "vitest",
    "check:gen-clean": "tsx scripts/check-generated-clean.ts",
    "release": "changeset",
    "version": "changeset version && pnpm build",
    "publish:pkg": "changeset publish"
  }
}
```

## 6) Tiny Runtime & Errors

**`src/runtime/index.ts`**

* Accepts `fetchImpl?: typeof fetch`, `timeoutMs?: number`, `retry?: { retries: number; ... }` (basic exponential backoff).
* Adds `AbortController` timeout wrapper (polyfill only in Node tests if needed).
* Centralizes `handleResponse` (parse JSON safely; attach `status`, `headers`).

**`src/errors.ts`**

* `export class HttpError extends Error { status: number; body?: unknown }`
* `export const isHttpError = (err: unknown): err is HttpError => ...`

## 7) Testing Strategy

**Test layers**

1. **Unit + contract tests (Node + msw)**

   * For each operation: success case, a 4xx error, and a non‑JSON/invalid payload case.
   * Schema edge cases: optional fields, enums, date strings.
   * Pagination helpers (if any) and query serialization.

2. **Edge runtime smoke (Miniflare)**

   * Imports built client into a Miniflare worker and executes 1–2 calls against msw or a local mock server to confirm no Node globals leak.

**Vitest/MSW setup**

* `test/setup-msw.ts`: `setupServer(...handlers)`; lifecycle hooks; `afterEach(server.resetHandlers)`.
* `test/handlers/*.ts`: handlers mirror the OpenAPI paths; keep payloads in `test/fixtures`.

**Coverage**

* Aim for >90% statements on `src/runtime`, >80% on generated services (pragmatic).

## 8) CI/CD

### 8.1 `ci.yml` (push/PR)

* Node 20 (matrix: 18, 20, 22 is fine but 20 is default).
* Steps: checkout → setup pnpm & node → install → `pnpm gen` → `pnpm check:gen-clean` → `pnpm build` → `pnpm test`.
* Lint/format (optional) before tests.

### 8.2 `drift.yml` (scheduled)

* **Cron**: daily `0 2 * * *` (UTC). Also `workflow_dispatch`.
* Steps:

  1. Fetch upstream spec → `spec/simap.upstream.yaml`.
  2. (Optional) Normalize → `spec/simap.yaml`.
  3. If diff vs HEAD, run `pnpm gen`, `pnpm build`, `pnpm test`.
  4. If tests **pass**: open PR titled `chore(spec): update SIMAP spec (YYYY‑MM‑DD)` with generated changes.
  5. If tests **fail**: create GitHub Issue `Upstream API breaking change detected` and **notify Slack** (and Telegram if configured).

**Notes**

* Use `peter-evans/create-pull-request` for PRs.
* Slack notifications via `SLACK_WEBHOOK_URL` secret; Telegram via bot `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`.

### 8.3 `release.yml` (manual)

* Trigger: `workflow_dispatch` **or** merge of a Changesets Release PR.
* Steps: `changeset version` → build → publish to npm (automation token) → create GitHub Release with changelog.
* Enable `--provenance` on publish; `npm` config uses `NPM_TOKEN` (automation).

## 9) Example GitHub Actions (snippets)

**ci.yml**

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm gen
      - run: pnpm check:gen-clean
      - run: pnpm build
      - run: pnpm test
```

**drift.yml**

```yaml
name: Detect Spec Drift
on:
  schedule:
    - cron: '0 2 * * *' # 02:00 UTC daily
  workflow_dispatch: {}
jobs:
  drift:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsx scripts/fetch-spec.ts
      - name: Detect diff
        id: diff
        run: |
          if git diff --quiet -- spec/simap.yaml; then echo "changed=false" >> $GITHUB_OUTPUT; else echo "changed=true" >> $GITHUB_OUTPUT; fi
      - if: steps.diff.outputs.changed == 'true'
        run: |
          pnpm gen
          pnpm build
          pnpm test
      - if: steps.diff.outputs.changed == 'true'
        uses: peter-evans/create-pull-request@v6
        with:
          branch: chore/update-spec
          title: 'chore(spec): update SIMAP spec'
          commit-message: 'chore(spec): update SIMAP spec'
          body: 'Automated update from upstream spec. Please review.'
      - if: failure()
        name: Open Issue on Failure
        uses: actions/github-script@v7
        with:
          script: |
            const { data } = await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Upstream API breaking change detected',
              body: 'Tests failed after updating the spec. Investigate breaking changes.'
            })
      - if: failure()
        name: Notify Slack
        uses: slackapi/slack-github-action@v1.27.0
        with:
          payload: |
            { "text": "SIMAP client: drift job failed on ${GITHUB_REPOSITORY}." }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**release.yml**

```yaml
name: Release
on:
  workflow_dispatch: {}
  push:
    branches: [main]
    paths: [ '.changeset/**' ]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Version packages
        run: pnpm changeset version
      - name: Publish
        run: pnpm changeset publish --no-git-tag --provenance
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

## 10) README.md (must‑haves)

* Badges: npm version, CI, license.
* Install: `pnpm add @tenderlift/simap`
* Quickstart: Node and Workers snippets.
* Runtime matrix: Node>=18, Cloudflare/Vercel Edge; **browsers must proxy** SIMAP (CORS).
* Generation details: exact generator & command; how to regenerate.
* Versioning & changelog policy (changesets; semver).
* Non‑affiliation disclaimer.

## 11) CONTRIBUTING.md

* Requirements: Node 20+, pnpm.
* Commands: `pnpm gen`, `pnpm test`, `pnpm build`.
* How to add coverage for a new endpoint (handler + tests + fixtures).
* Commit style: Conventional Commits (optional) or rely on Changesets summaries.
* How drift PRs are handled (review, merge, and release steps).

## 12) SECURITY.md

* Scope: Library only; no credentials stored.
* Report security concerns privately via email.

## 13) LICENSE

* MIT text.
* Add `NOTICE` block in README:

  > This project is not affiliated with or endorsed by SIMAP. Trademarks belong to their owners.

## 14) npm Publishing & Org

* Create scope `@tenderlift` if not present.
* Package name: `@tenderlift/simap` (reserved in npm; fill metadata: homepage, repository, bugs, keywords).
* Enable **npm automation token** (2FA: automation) as `NPM_TOKEN` secret.
* Use provenance on publish (supply‑chain integrity).

## 15) Notifications

* Slack (primary): `SLACK_WEBHOOK_URL` secret; drift failures and release success messages.
* Telegram (optional): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
* GitHub Issues auto‑opened on drift test failures.

## 16) Risk Register & Mitigations

* **Upstream spec instability** → Mitigate with pinned spec + daily drift PR + failing tests when breaking.
* **Runtime incompatibilities** (Edge) → Keep runtime minimal; CI includes a Miniflare smoke test.
* **CORS for browsers** → Clearly document proxy requirement; don’t expose browser‑only examples.
* **Generator changes** → Pin generator version; add `check:gen-clean` to CI.

## 17) Implementation Plan (phased)

**Phase 0 – Repo bootstrap**

* Create repo, default branch `main`, protections (required checks: build, test, gen‑clean).
* Add boilerplate files (LICENSE, README, CONTRIBUTING, SECURITY, CODE\_OF\_CONDUCT, .editorconfig, .gitignore).
* Setup pnpm, tsconfig, tsup, vitest.

**Phase 1 – Spec & Generation**

* Add `spec/simap.yaml` (current, approved).
* Add `codegen.config.ts`; run `pnpm gen` and commit generated output into `src/gen`.
* Add thin runtime + errors and `src/index.ts` re‑exports.

**Phase 2 – Tests**

* Wire `msw` and add tests for 2–3 representative endpoints (list/get/create or equivalent) with success + error + invalid payload.
* Add Miniflare runtime smoke test.

**Phase 3 – CI & Drift**

* Add `ci.yml` (gen‑check, build, test).
* Add `drift.yml` with Slack notification; verify PR opens on synthetic change.

**Phase 4 – Docs & Examples**

* Flesh out README (install, quickstart, runtime matrix, generation notes).
* Add `examples/` (Node, Workers).

**Phase 5 – Release**

* Initialize Changesets; create first release PR; publish `0.1.0` to npm.

**Phase 6 – Coverage Expansion**

* Iterate to cover remaining endpoints; enforce policy: new endpoint ⇒ tests + handlers.

## 18) Definition of Done

* CI green on `main` with required checks.
* Daily drift job merged & notifying Slack.
* Package published to npm with README badges & changelog.
* ≥3 representative endpoints fully tested (success & error). Edge smoke passes.
* Governance docs present (LICENSE, CONTRIBUTING, SECURITY, CODE OF CONDUCT).

---

### Appendix A – Example Files

**`tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false
});
```

**`vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    setupFiles: ['test/setup-msw.ts'],
    environment: 'node',
    coverage: { reporter: ['text', 'lcov'] }
  }
});
```

**`scripts/check-generated-clean.ts`**

```ts
import { execSync } from 'node:child_process';
try {
  execSync('git diff --quiet -- src/gen');
} catch {
  console.error('Generated sources are not up-to-date. Run pnpm gen and commit changes.');
  process.exit(1);
}
```

**`src/index.ts`**

```ts
export * as types from './gen/schemas';
export * from './gen/services';
export { createClient } from './runtime';
export * from './errors';
```

**`README` badges (snippet)**

```md
[![CI](https://github.com/<org>/simap-ts-client/actions/workflows/ci.yml/badge.svg)](…)
[![npm version](https://img.shields.io/npm/v/@tenderlift/simap.svg)](…)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
```
