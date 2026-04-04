# VoteJam Project Context

Claude reads this file when analyzing PRs. Keep it up-to-date so Claude understands your standards.

## Project Overview
**VoteJam**: A real-time party playlist voting app. Users vote on songs to add to a queue. Highest-voted songs play first.

## Technology Stack
- **Language**: TypeScript
- **Backend**: Express.js
- **Validation**: Zod
- **Testing**: Vitest
- **Database**: (Your DB here—SQL, Postgres, MongoDB, etc.)
- **Auth**: JWT-based (see requireAuth middleware)

## Architecture Patterns

### Repository Pattern
All database access goes through repositories (`/src/repositories/`). Example:
```typescript
// Good
const song = await songRepository.findById(id);

// Bad
const song = await db.query('SELECT * FROM songs WHERE id = ?', [id]);
```

### Middleware
- `requireAuth`: Validates JWT token, attaches user to `req.user`
- `validateRequest`: Uses Zod schemas to validate req.body

### Response Envelope
All API responses follow this format:
```typescript
{
  success: true,
  data: { /* payload */ },
  error: null
}
```

Errors:
```typescript
{
  success: false,
  data: null,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'q parameter is required'
  }
}
```

## Security Standards
- **No hardcoded secrets**: All config from environment variables
- **Server-side validation**: Every endpoint validates input with Zod
- **Parameterized queries**: Prevent SQL injection
- **Auth required**: Most endpoints use `requireAuth` middleware
- **Rate limiting**: (If implemented, describe here)

## Testing Requirements
- **Coverage target**: 80%+ across all endpoints
- **Test structure**: One describe block per endpoint
- **Naming**: Test names should describe the scenario and expected outcome
- Example:
```typescript
describe('POST /api/v1/songs', () => {
  test('returns 201 and song object on valid request', async () => { ... });
  test('returns 400 VALIDATION_ERROR when title is missing', async () => { ... });
  test('returns 401 when not authenticated', async () => { ... });
});
```

## Code Style
- Use `const` over `let`
- Prefer `async/await` over `.then()`
- Name functions with `get`, `find`, `create`, `update`, `delete` prefixes
- Use descriptive variable names (avoid `x`, `tmp`, `data`)

## Project Structure
```
src/
  ├── routes/        # API endpoints
  ├── repositories/  # Data access
  ├── middleware/    # Express middleware
  ├── schemas/       # Zod validation schemas
  ├── types.ts       # TypeScript interfaces
  └── index.ts       # Server entry point
tests/
  └── routes/        # Endpoint tests
```

## Common Issues to Flag
- Missing input validation
- Hardcoded secrets or tokens
- No tests for new endpoints
- Inefficient database queries
- Type-safety violations (use `any` only when necessary)
- Missing error handling

---

**Last Updated**: 2026-04-03
**Maintainer**: Ron Dagdag
