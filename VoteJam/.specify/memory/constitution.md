<!--
SYNC IMPACT REPORT
==================
Version change: N/A (initial ratification) → 1.0.0
Principles added:
  - I. Red-Green TDD (NON-NEGOTIABLE) [new — user mandate]
  - II. Repository Pattern [new]
  - III. Input Validation at Boundary [new]
  - IV. Security by Default [new]
  - V. Consistent API Contract [new]
Sections added:
  - Development Standards
  - Testing Standards
Templates updated:
  - .specify/templates/tasks-template.md ✅ — removed "Tests are OPTIONAL" language
    that conflicts with the Red-Green TDD principle
  - .specify/templates/plan-template.md ✅ — Constitution Check gates documented
  - .specify/templates/spec-template.md ✅ — no changes required
Deferred TODOs: none
-->

# VoteJam Constitution

## Core Principles

### I. Red-Green TDD (NON-NEGOTIABLE)

Tests MUST be written before any implementation code. The cycle is
strictly: **Red** (write a failing test) → **Green** (write minimum
code to pass) → **Refactor** (clean up without breaking tests).

- No implementation code is written without a prior failing test
- Tests MUST fail for the right reason before implementation begins
- Vitest + Supertest is the mandated testing stack; no substitutions
- Every route file MUST have a matching file in `src/routes/__tests__/`
- Minimum 4 scenarios per endpoint: happy path, auth failure,
  validation failure, and business-logic failure (duplicate, not found, etc.)

### II. Repository Pattern

All data access MUST go through repository classes. Route handlers
MUST NOT access data stores directly.

- One repository class per resource (e.g., `songRepo`)
- Repositories OWN ID generation; route handlers MUST NOT create IDs
- Business constraints (e.g., one vote per user per song) are enforced
  in the repository layer, never in route handlers
- Swapping in-memory stores for PostgreSQL MUST require zero route changes

### III. Input Validation at Boundary

All request input MUST be validated with Zod schemas at the route entry
point, before any handler logic runs.

- Zod schemas are defined at the top of each route file, never inline
- `validateBody(ZodSchema)` middleware wraps all mutation routes
- `req.body` fields MUST NOT be accessed directly without a prior schema
- UUID format MUST be validated before any repository query

### IV. Security by Default

Security controls are applied automatically. Developers MUST NOT opt in
— controls MUST be present unless explicitly justified otherwise.

- `requireAuth` MUST be applied to all mutation routes (POST, PUT,
  PATCH, DELETE); read endpoints are public unless specified otherwise
- Rate limiting is server-side only via `express-rate-limit`;
  client-side-only enforcement is forbidden
- Parameterized queries only; string-concatenated SQL is forbidden
- TypeScript `any` type is forbidden; use `unknown` and narrow, or
  define an explicit interface/type

### V. Consistent API Contract

Every response — success or error — MUST use the `ApiResponse<T>`
envelope. There are no exceptions.

- Success: `{ data: T, error: null }`
- Error: `{ data: null, error: { code: string, message: string } }`
- Errors are thrown via `AppError`; silent catch-and-swallow is forbidden
- Error codes MUST be one of: `UNAUTHORIZED`, `VALIDATION_ERROR`,
  `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`
- API routes MUST follow kebab-case plural nouns under `/api/v1/`

## Development Standards

TypeScript strict mode (`"strict": true`) is mandatory. No implicit
`any`. All exported functions MUST carry explicit return types.

- `console.log` MUST NOT appear in committed code; remove or replace
  with structured logging before merging
- Business logic MUST NOT be placed in middleware; middleware handles
  cross-cutting concerns only (auth, validation, rate limiting, errors)
- `AppError` MUST be thrown for all application-level errors; plain
  `Error` is forbidden inside route and repository code

## Testing Standards

Tests are co-located in `src/routes/__tests__/` and mirror the route
file under test. Per the Red-Green TDD principle, tests are written
**first** and MUST be confirmed failing before implementation begins.

Mandatory scenarios for every endpoint:

1. **Happy path** — valid request returns expected response + status code
2. **Authentication failure** — missing/invalid token → 401 UNAUTHORIZED
3. **Validation failure** — missing/invalid field → 400 VALIDATION_ERROR
4. **Business-logic failure** — duplicate, not found, etc. → correct code

Target: >90% branch coverage on repository and route handler logic.

## Governance

This constitution supersedes all other team practices, README guidelines,
and ad-hoc conventions. All PRs and code reviews MUST verify compliance.

Amendment procedure:
1. Write a rationale explaining the change and its impact
2. Increment the version following semantic versioning:
   - MAJOR: Backward-incompatible removal or redefinition of a principle
   - MINOR: New principle or materially expanded section added
   - PATCH: Clarifications, wording, or non-semantic refinements
3. Update all dependent templates in `.specify/templates/`
4. Use commit message: `docs: amend constitution to vX.Y.Z (summary)`

Complexity beyond the simplest correct solution MUST be explicitly
justified in the PR description before merging.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2026-04-20
