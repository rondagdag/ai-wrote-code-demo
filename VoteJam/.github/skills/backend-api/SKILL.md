---
name: backend-api
description: >
  Deep backend development patterns for VoteJam's Express/TypeScript API.
  Use when building new API routes, repository methods, middleware, or rate limiting.
  Activates automatically when working on endpoints, handlers, controllers,
  route files, or anything in src/routes/, src/repositories/, or src/middleware/.
allowed-tools:
  - read_file
  - write_file
  - run_terminal_command
---

# Backend API Skill — VoteJam

This skill loads automatically when Copilot detects backend API work. It provides deep domain context on top of the always-on `.github/copilot-instructions.md`.

---

## Route Checklist

Every route must pass all of these before committing:

- [ ] Zod schema defined at **file top** — not inline in handler
- [ ] `requireAuth` on every mutation (POST, PUT, PATCH, DELETE)
- [ ] `validateBody(Schema)` before the handler
- [ ] Repository call — never direct data access in the handler
- [ ] `ApiResponse<T>` envelope on every response
- [ ] Correct HTTP status code: `201` creates · `200` reads · `409` conflicts · `429` rate limited
- [ ] `AppError` thrown for errors — never `res.status().json()` directly
- [ ] Test file at `src/routes/__tests__/[resource].test.ts`

---

## Error Handling

```typescript
// Always throw AppError — the global handler formats the ApiResponse envelope
throw new AppError('Song not found', 404, 'NOT_FOUND');
throw new AppError('Already voted on this song', 409, 'CONFLICT');
throw new AppError('Too many requests', 429, 'RATE_LIMITED');

// NEVER do this — bypasses the envelope
return res.status(404).json({ error: 'Not found' });  // ❌
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 10,               // 10 votes per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: { code: 'RATE_LIMITED', message: 'Too many requests' },
  },
});

// Attach after requireAuth, before validateBody
router.post('/api/v1/songs/:songId/vote', requireAuth, voteLimiter, validateBody(VoteSchema), handler);
```

---

## Repository Patterns

```typescript
export const songRepo = {
  // Read — return T | null, never throw for not-found
  findById(id: string): Song | null {
    return songs.find(s => s.id === id) ?? null;
  },

  // Create — assign id + timestamps here, not in routes
  create(input: Omit<Song, 'id' | 'createdAt'>): Song {
    const song: Song = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    songs.push(song);
    return song;
  },

  // Business rules enforced here — not in route handlers
  hasVoted(songId: string, userId: string): boolean {
    return votes.some(v => v.songId === songId && v.userId === userId);
  },
};
```

## Pagination Pattern

```typescript
const ListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get('/api/v1/songs', (req, res) => {
  const { limit, offset } = ListQuerySchema.parse(req.query);
  const all = songRepo.getAll();
  const response: ApiResponse<{ songs: Song[]; total: number }> = {
    data: { songs: all.slice(offset, offset + limit), total: all.length },
    error: null,
  };
  res.status(200).json(response);
});
```

---

## Complete Reference Implementation

A fully correct voting endpoint — use for comparison when reviewing generated code:

```typescript
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { songRepo } from '../repositories/songRepo';
import { voteRepo } from '../repositories/voteRepo';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/ApiResponse';
import { Vote } from '../types/Vote';

const router = Router();

const VoteSchema = z.object({
  direction: z.enum(['up', 'down']),
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { data: null, error: { code: 'RATE_LIMITED', message: 'Too many votes' } },
});

router.post(
  '/api/v1/songs/:songId/vote',
  requireAuth,
  voteLimiter,
  validateBody(VoteSchema),
  (req: Request, res: Response) => {
    const { songId } = req.params;
    const { direction } = req.body;
    const userId = req.user!.id;

    const song = songRepo.findById(songId);
    if (!song) throw new AppError('Song not found', 404, 'NOT_FOUND');

    if (voteRepo.hasVoted(songId, userId)) {
      throw new AppError('Already voted on this song', 409, 'CONFLICT');
    }

    const vote = voteRepo.create({ songId, userId, direction });
    songRepo.applyVote(songId, direction);

    const response: ApiResponse<Vote> = { data: vote, error: null };
    res.status(201).json(response);
  }
);

export default router;
```
