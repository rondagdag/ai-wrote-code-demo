# VoteJam — GitHub Copilot Custom Instructions

This file is automatically loaded by GitHub Copilot for every interaction in this repository.
It gives Copilot your team's patterns, security rules, and testing standards — no prompting required.

---

## Project Overview

VoteJam is a party playlist voting API. TypeScript + Express + Zod. In-memory repository pattern.
Auth is Bearer token based. All mutation endpoints require authentication.

**Stack:**
- Runtime: Node.js 20+
- Framework: Express.js
- Language: TypeScript (strict mode)
- Validation: Zod
- Testing: Vitest + Supertest

**Key files:**
- `src/routes/` — Route handlers (one file per resource)
- `src/repositories/` — Data access layer (songRepo, etc.)
- `src/middleware/auth.ts` — `requireAuth` middleware
- `src/middleware/validation.ts` — `validateBody(schema)` middleware
- `src/types/` — Shared TypeScript interfaces
- `src/utils/errors.ts` — `AppError` class

---

## Coding Patterns

### Route Structure
Every route file follows this pattern exactly:

```typescript
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { songRepo } from '../repositories/songRepo';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/ApiResponse';
import { Song } from '../types/Song';

const router = Router();

// Define Zod schema at the top of the file
const CreateSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  artist: z.string().min(1, 'Artist is required').max(200),
});

// Route: requireAuth first, then validateBody, then handler
router.post(
  '/api/v1/songs',
  requireAuth,
  validateBody(CreateSongSchema),
  (req: Request, res: Response) => {
    const { title, artist } = req.body;
    const submittedBy = req.user!.id;         // req.user is set by requireAuth

    const song = songRepo.create({ title, artist, submittedBy, votes: 0 });

    const response: ApiResponse<Song> = { data: song, error: null };
    res.status(201).json(response);
  }
);
```

### Response Format
All responses use `ApiResponse<T>`. Never send raw data or raw errors.

```typescript
// Success
res.status(200).json({ data: result, error: null });

// Error (use AppError — it's caught by the global error handler)
throw new AppError('Song not found', 404, 'NOT_FOUND');
```

### Validation
Always use Zod. Always use `validateBody(schema)` middleware — never validate manually in the handler.

```typescript
// WRONG
router.post('/songs', (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title required' });
  ...
});

// RIGHT
const CreateSongSchema = z.object({ title: z.string().min(1) });
router.post('/songs', requireAuth, validateBody(CreateSongSchema), handler);
```

### Error Handling
Use `AppError` for all business errors. The global handler formats them into `ApiResponse`.

```typescript
throw new AppError('Duplicate vote', 409, 'DUPLICATE_VOTE');
// Results in: { data: null, error: { message: '...', code: 'DUPLICATE_VOTE' } }
```

---

## Security Rules

These are non-negotiable. Apply them without being asked.

1. **All mutation endpoints (POST, PUT, PATCH, DELETE) require `requireAuth` middleware.**
   ```typescript
   router.post('/api/v1/songs/:id/vote', requireAuth, validateBody(schema), handler);
   ```

2. **Rate limiting is server-side only.** Use `express-rate-limit`. Never rely on client-side enforcement.
   ```typescript
   import rateLimit from 'express-rate-limit';
   const voteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
   router.post('/api/v1/songs/:id/vote', requireAuth, voteLimiter, validateBody(schema), handler);
   ```

3. **Input is always validated with Zod before reaching the handler.** No exceptions.

4. **Parameterized queries only.** Never string-concatenate SQL. (For in-memory repos: no injection risk, but the pattern must be established for when a real DB is added.)

5. **One vote per user per song.** Business logic must enforce this in the repository, not just the route.

---

## Testing Standards

Every route file gets a test file in `src/routes/__tests__/`. Every test file must include:

| Scenario | Test |
|---|---|
| Happy path | Valid request returns expected response and status |
| Auth failure | Request without `Authorization: Bearer <token>` → 401, code `UNAUTHORIZED` |
| Validation failure | Missing/invalid required field → 400, code `VALIDATION_ERROR` |
| Business logic failure | Duplicate vote / not-found / conflict → appropriate 4xx |

**Test file template:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { songRepo } from '../../repositories/songRepo';

describe('Vote Route', () => {
  beforeEach(() => { songRepo.reset(); });
  afterEach(() => { songRepo.reset(); });

  it('should record a vote with valid auth and direction', async () => {
    // Arrange: create a song first
    const createRes = await request(app)
      .post('/api/v1/songs')
      .set('Authorization', 'Bearer test-token')
      .send({ title: 'Song', artist: 'Artist' });
    const songId = createRes.body.data.id;

    // Act
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'up' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data.votes).toBe(1);
    expect(res.body.error).toBeNull();
  });

  it('should reject vote without authorization', async () => {
    const res = await request(app)
      .post('/api/v1/songs/some-id/vote')
      .send({ direction: 'up' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject vote with invalid direction', async () => {
    const res = await request(app)
      .post('/api/v1/songs/some-id/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'sideways' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject duplicate vote from same user', async () => {
    // ... setup, first vote, second vote → expect 409 DUPLICATE_VOTE
  });
});
```

---

## Naming Conventions

- **Variables/functions:** `camelCase` — `songId`, `requireAuth`, `validateBody`
- **Types/Interfaces:** `PascalCase` — `Song`, `ApiResponse`, `CreateSongInput`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_TITLE_LENGTH`
- **Route files:** `kebab-case.ts` — `songs.ts`, `vote-history.ts`
- **Test files:** `<resource>.test.ts` in `__tests__/` — `songs.test.ts`
- **Zod schemas:** `PascalCase + Schema` — `CreateSongSchema`, `VoteSchema`

---

## What NOT to Do

- Don't validate in the route handler — use `validateBody(schema)` middleware
- Don't send raw objects/errors — always use `ApiResponse<T>`
- Don't leave mutation endpoints without `requireAuth`
- Don't put rate limiting on the client side
- Don't skip the test file
- Don't use `any` type — TypeScript strict mode is always on
