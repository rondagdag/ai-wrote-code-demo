# Backend Development Skill — VoteJam

## Purpose
This Skill provides backend development patterns, security rules, and testing
conventions for the VoteJam Express/TypeScript API — structured for use as GitHub
Copilot custom instructions. Include this in `.github/copilot-instructions.md` when
working on API routes, repositories, or middleware.

---

## Tech Stack
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Validation:** Zod schemas
- **Testing:** Vitest + Supertest
- **Database:** PostgreSQL with parameterized queries
- **Architecture:** Repository pattern for data access

---

## Project Structure
```
src/
  routes/           # Express route handlers (one per resource)
  repositories/     # Data access layer (database queries)
  middleware/       # Express middleware (auth, validation, error handling)
  utils/            # Shared utilities (errors, logging, helpers)
  types/            # TypeScript type definitions
  routes/__tests__/  # Route tests (adjacent to source)
```

---

## Core Patterns

### 1. Route Handler Pattern

All route handlers follow this structure:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { SongRepository } from '../repositories/songRepository';
import { AppError } from '../utils/errors';

const router = Router();

// Define validation schema
const createSongSchema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
});

// Define route with middleware chain
router.post(
  '/songs',
  requireAuth,                          // Always auth first
  validateBody(createSongSchema),       // Then validate input
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const song = await SongRepository.create({
        ...req.body,
        submittedBy: req.user.id,
      });
      res.status(201).json({
        data: song,
        error: null,
      });
    } catch (err) {
      next(err); // Pass to error handler middleware
    }
  }
);

export const songRoutes = router;
```

**Rules:**
- Import required dependencies at the top
- Define Zod schema before the route handler
- Apply middleware in order: auth → validation → handler
- Use async/await with try/catch
- Pass errors to `next()` for centralized error handling
- Wrap data in consistent response format: `{ data: T, error: null }`

---

### 2. Repository Pattern (Data Access)

Always use repositories for database access. Never write SQL in route handlers.

```typescript
import { pool } from '../config/database';
import type { Song } from '../types/song';

export class SongRepository {
  static async create(data: {
    title: string;
    artist: string;
    submittedBy: string;
  }): Promise<Song> {
    const result = await pool.query(
      `INSERT INTO songs (title, artist, submitted_by, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, title, artist, submitted_by, votes, created_at`,
      [data.title, data.artist, data.submittedBy]
    );

    return this.mapToSong(result.rows[0]);
  }

  static async findById(id: string): Promise<Song | null> {
    const result = await pool.query(
      `SELECT * FROM songs WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapToSong(result.rows[0]) : null;
  }

  static async vote(
    songId: string,
    userId: string,
    direction: 'up' | 'down'
  ): Promise<{ voteCount: number }> {
    // Check if user already voted
    const existing = await pool.query(
      `SELECT id FROM votes WHERE song_id = $1 AND user_id = $2`,
      [songId, userId]
    );

    if (existing.rows.length > 0) {
      throw new AppError('User has already voted on this song', 409);
    }

    // Record vote
    await pool.query(
      `INSERT INTO votes (song_id, user_id, direction, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [songId, userId, direction]
    );

    // Get updated vote count
    const count = await pool.query(
      `SELECT COUNT(*) as total FROM votes WHERE song_id = $1 AND direction = 'up'`,
      [songId]
    );

    return { voteCount: parseInt(count.rows[0].total, 10) };
  }

  private static mapToSong(row: any): Song {
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      submittedBy: row.submitted_by,
      votes: row.votes,
      createdAt: row.created_at,
    };
  }
}
```

**Rules:**
- One repository per resource (SongRepository, VoteRepository, etc.)
- All database queries use parameterized queries (`$1`, `$2`, etc.) — **NEVER string concatenation**
- Methods return domain objects (Song, Vote), not raw rows
- Include a private `mapToSong()` method to transform DB rows
- Throw `AppError` for business logic violations (see Security Rules below)
- All queries are async functions

---

### 3. Error Handling

Create an `AppError` class for consistent error responses:

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    data: null,
    error: { code, message },
  });
};
```

**Response format:**
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 1 character"
  }
}
```

---

### 4. Authentication Middleware

All endpoints require authentication unless explicitly marked as public.

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user: { id: string };
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.slice(7);
  // In real app: verify JWT token
  req.user = { id: `user-${token}` };

  next();
};
```

**Rule:** Every endpoint must have `requireAuth` middleware unless it's explicitly public (e.g., login, health check).

---

## Validation with Zod

Always validate request input with Zod before processing:

```typescript
import { z } from 'zod';

// Define schema at route level
const voteSchema = z.object({
  direction: z.enum(['up', 'down']),
});

const idParamSchema = z.object({
  songId: z.string().uuid(),
});

// Use in route
router.post('/songs/:songId/vote',
  requireAuth,
  validateBody(voteSchema),
  validateParams(idParamSchema),
  async (req, res, next) => {
    // Input is guaranteed valid here
    const { direction } = req.body;
    const { songId } = req.params;
    // ...
  }
);
```

---

## Testing Requirements

Every route handler must have a corresponding test file:

```typescript
// src/routes/__tests__/songs.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('POST /api/v1/songs/:songId/vote', () => {
  it('allows authenticated user to vote', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('voteCount');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .send({ direction: 'up' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects invalid direction', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'sideways' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('prevents duplicate votes from same user', async () => {
    // First vote succeeds
    await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'up' });

    // Second vote fails
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', 'Bearer test-token')
      .send({ direction: 'down' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
```

**Test coverage minimum:**
- Happy path (valid input, happy user)
- Authentication failure
- Validation failure
- Business logic violation (e.g., duplicate vote)

---

## Security Rules (Non-Negotiable)

1. **NEVER hardcode secrets** — Always use environment variables
   ```typescript
   // WRONG
   const dbPassword = 'postgres-password-123';

   // RIGHT
   const dbPassword = process.env.DATABASE_PASSWORD;
   if (!dbPassword) throw new Error('DATABASE_PASSWORD not set');
   ```

2. **ALWAYS use parameterized queries** — Never string concatenation
   ```typescript
   // WRONG
   await pool.query(`SELECT * FROM songs WHERE id = '${id}'`);

   // RIGHT
   await pool.query(`SELECT * FROM songs WHERE id = $1`, [id]);
   ```

3. **ALL endpoints require auth** — Unless explicitly public
   ```typescript
   // WRONG — no auth middleware
   router.post('/songs', async (req, res) => { ... });

   // RIGHT
   router.post('/songs', requireAuth, async (req, res) => { ... });
   ```

4. **Validate all input** — Use Zod before touching the data
   ```typescript
   // WRONG — assuming body is valid
   const title = req.body.title; // Could be undefined, wrong type, too long

   // RIGHT
   const schema = z.object({ title: z.string().min(1).max(200) });
   const { title } = schema.parse(req.body);
   ```

5. **Rate limiting is server-side** — Never rely on client-side only
   ```typescript
   // Use express-rate-limit or similar
   import rateLimit from 'express-rate-limit';

   const voteLimit = rateLimit({
     windowMs: 60 * 1000,
     max: 10, // 10 votes per minute per IP
   });

   router.post('/songs/:songId/vote', voteLimit, requireAuth, ...);
   ```

---

## Naming Conventions

- **Variables/functions:** `camelCase` — `songId`, `getUserById()`
- **Types/interfaces:** `PascalCase` — `Song`, `UserProfile`
- **Classes:** `PascalCase` — `SongRepository`, `AppError`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_TITLE_LENGTH = 200`
- **Database columns:** `snake_case` — `submitted_by`, `created_at`
- **Database tables:** `snake_case`, plural — `songs`, `votes`, `users`

---

## API Response Format

All endpoints return this shape:

```typescript
// Success
{
  "data": {
    "id": "song-123",
    "title": "Song Name",
    "votes": 42
  },
  "error": null
}

// Error
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

**Status codes:**
- `200` — Success, data returned
- `201` — Created
- `400` — Validation or client error
- `401` — Unauthorized (missing/invalid auth)
- `409` — Conflict (e.g., duplicate vote)
- `500` — Server error

---

## File Checklist

When adding a new backend feature, include:

- [ ] Route handler in `src/routes/` with Zod validation
- [ ] Repository method in `src/repositories/`
- [ ] Error handling via AppError
- [ ] Auth middleware on protected endpoints
- [ ] Test file in `src/routes/__tests__/`
- [ ] Database migration (if needed)
- [ ] Type definitions in `src/types/`

---

## Quick Reference

| Need | File/Pattern |
|------|-------------|
| New endpoint | `src/routes/` + validation schema + tests |
| New database access | Repository method in `src/repositories/` |
| Custom error | Throw `AppError(message, statusCode, code)` |
| Input validation | Zod schema + `validateBody()` middleware |
| Authentication | `requireAuth` middleware |
| Database query | Use repository, parameterized queries only |
| Testing | Vitest + Supertest in `__tests__/` |
| Environment variables | Always use `process.env.*` |
