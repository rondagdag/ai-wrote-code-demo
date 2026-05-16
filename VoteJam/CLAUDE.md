# VoteJam Project Context

## Overview
VoteJam is a collaborative music voting platform. This document guides code generation for new features.

## Technology Stack
- **Runtime:** Node.js 18+ (TypeScript)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Validation:** Zod
- **Testing:** Vitest + Supertest

## Coding Standards

### TypeScript
- Strict mode enabled: `"strict": true` in tsconfig.json
- No implicit any
- Explicit return types on all functions
- Use interfaces for request/response contracts

### API Design
- RESTful endpoints under `/api/v1/`
- Bearer token authentication via `Authorization: Bearer <token>`
- Standard error response format:
  ```typescript
  { error: { code: string, message: string }, data: null }
  ```
- Success response format:
  ```typescript
  { data: T, error: null }
  ```

### Database
- Parameterized queries (never string concatenation)
- UUID primary keys: `gen_random_uuid()`
- Timestamps: `created_at` (immutable), `updated_at` (mutable)
- Indexes on foreign keys and common filters
- CASCADE delete for related records

### Validation
- All request bodies validated with Zod schemas
- Validation happens at route entry, not in handlers
- UUID format validated before DB queries
- Direction enum: `'up' | 'down'`

### Architecture
- **Routes:** In `src/routes/`, one file per resource
- **Handlers:** Business logic, validation done upstream
- **Middleware:** Auth (`requireAuth`), rate limiting (`rateLimit`), error handling
- **Tests:** Co-located in `src/tests/`, mirror route structure
- **Repository pattern:** Abstract DB access; one repository class per table

## Middleware Available
- `requireAuth` — validates bearer token, adds `req.userId`
- `rateLimit` — (name, limit, window) e.g., rateLimit('vote', 10, 60000)
- Error handler catches errors and formats response

## Testing
- Write tests for happy path and edge cases
- Test error responses (4xx, 5xx)
- Use fixtures for database state
- Aim for >90% coverage on business logic
