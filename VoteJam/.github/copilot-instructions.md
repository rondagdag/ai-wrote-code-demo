# VoteJam — GitHub Copilot Instructions

> This file is automatically loaded by GitHub Copilot for every chat and inline suggestion
> in this repository. It is the team's AI onboarding packet — write it once, every session benefits.

---

## Project Overview

**VoteJam** is a party playlist voting API. Users submit songs and vote them up or down.
Highest-voted songs surface first. Built for live demo purposes; production-quality patterns apply.

### Tech Stack
- **Runtime**: Node.js 20+, TypeScript (strict mode)
- **Framework**: Express.js
- **Validation**: Zod (all input, always)
- **Testing**: Vitest + Supertest
- **Auth**: Bearer token via `Authorization: Bearer <token>` header
- **DB**: In-memory repository pattern (swap to PostgreSQL without changing route logic)

### Key Files
```
src/
  routes/songs.ts          ← Route handlers — follow this pattern exactly
  middleware/auth.ts        ← requireAuth middleware — attach to all mutations
  middleware/validation.ts  ← validateBody(ZodSchema) — validate at route entry
  repositories/songRepo.ts  ← Data access — never query DB directly in routes
  types/ApiResponse.ts      ← Response envelope — every response uses this
  types/Song.ts             ← Song type — source of truth
  utils/errors.ts           ← AppError — throw this, not plain Error
```

---

## Coding Patterns

### Route Structure
Every new route file must follow this exact pattern:

```typescript
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { songRepo } from '../repositories/songRepo';  // swap for relevant repo
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/ApiResponse';

const router = Router();

// Define Zod schema at file top — never inline in the handler
const CreateThingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  // add fields here
});

// Mutations: requireAuth → validateBody → handler
router.post('/api/v1/things', requireAuth, validateBody(CreateThingSchema), (req, res) => {
  const { title } = req.body;
  const userId = req.user!.id;  // req.user is guaranteed by requireAuth

  // use repository — never access in-memory store directly
  const thing = thingRepo.create({ title, submittedBy: userId });

  const response: ApiResponse<typeof thing> = { data: thing, error: null };
  res.status(201).json(response);
});

// Read endpoints: no auth required
router.get('/api/v1/things', (req, res) => {
  const things = thingRepo.getAll();
  const response: ApiResponse<typeof things> = { data: things, error: null };
  res.status(200).json(response);
});

export default router;
```

### Response Envelope
**Every** response — success or error — uses `ApiResponse<T>`:
```typescript
// Success
{ data: T, error: null }

// Error (thrown via AppError — the error handler formats this)
throw new AppError('Not found', 404, 'NOT_FOUND');
// → { data: null, error: { code: 'NOT_FOUND', message: 'Not found' } }
```

### Error Codes
Use these exact strings for error codes:
- `UNAUTHORIZED` — missing/invalid auth token
- `VALIDATION_ERROR` — Zod validation failed
- `NOT_FOUND` — resource doesn't exist
- `CONFLICT` — duplicate / business rule violation
- `RATE_LIMITED` — too many requests

---

## Security Rules

These are **non-negotiables**. Apply without being asked.

1. **All mutations require `requireAuth`** — POST, PUT, PATCH, DELETE. Read endpoints (GET) are public unless specified.
2. **Rate limiting is server-side only** — use `express-rate-limit`. Never client-side.
3. **All request input validated with Zod** — use `validateBody(ZodSchema)` middleware. No raw `req.body` access without a schema.
4. **Parameterized queries only** — if connecting to a real DB, never string-concatenate SQL.
5. **One vote per user per song** — enforce in the repository layer, not in the route handler.

---

## Testing Standards

Every new route file needs a matching test file in `src/routes/__tests__/`.

### Required test scenarios (minimum 4):
1. **Happy path** — valid request returns expected response + status code
2. **Authentication failure** — no token → 401 UNAUTHORIZED
3. **Validation failure** — missing/invalid field → 400 VALIDATION_ERROR
4. **Business logic failure** — duplicate vote, not found, etc. → correct error code

### Test file template:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('POST /api/v1/songs/:songId/vote', () => {
  // Reset state between tests if using in-memory repos
  beforeEach(() => {
    // reset repo state here if needed
  });

  it('returns 200 when vote is cast successfully', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.error).toBeNull();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .send({ direction: 'up' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when direction is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'sideways' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 when user has already voted on this song', async () => {
    // Cast first vote
    await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'up' });

    // Second vote by same user → conflict
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'up' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Variables / functions | camelCase | `songId`, `createSong()` |
| Types / interfaces | PascalCase | `Song`, `ApiResponse<T>` |
| Constants | UPPER_SNAKE_CASE | `MAX_VOTES_PER_MINUTE` |
| Files | kebab-case | `song-repo.ts`, `rate-limit.ts` |
| Error codes | UPPER_SNAKE_CASE | `VALIDATION_ERROR` |
| API routes | kebab-case, plural nouns | `/api/v1/songs`, `/api/v1/songs/:id/vote` |

---

## What NOT to Do

- ❌ Don't use `any` type — use `unknown` and narrow, or define a type
- ❌ Don't access `req.body` fields directly — always go through `validateBody` first
- ❌ Don't catch and swallow errors silently — let `AppError` bubble to the error handler
- ❌ Don't add business logic in middleware — middleware handles cross-cutting concerns only
- ❌ Don't put SQL or data access in route handlers — use repositories
- ❌ Don't generate UUIDs in route handlers — let the repository layer own ID creation
- ❌ Don't use `console.log` for debugging in committed code — use structured logging or remove it

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-song-voting/plan.md
<!-- SPECKIT END -->
