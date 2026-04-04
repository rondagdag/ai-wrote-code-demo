# Backend API Skill — VoteJam

> **How to use:** Reference this file in Copilot Chat with `#file:skills/backend-api.md` when building backend routes, repositories, or middleware. It gives Copilot deep domain knowledge on top of the always-on `copilot-instructions.md`.

---

## When to Load This Skill

Load this file when:
- Adding a new API route (POST, GET, PUT, DELETE)
- Adding a new repository method
- Writing or extending middleware
- Debugging an API-related issue

---

## Express Route Checklist

Every route must pass all of these before committing:

- [ ] Zod schema defined at **file top** — not inline in the handler
- [ ] `requireAuth` on every mutation (POST, PUT, PATCH, DELETE)
- [ ] `validateBody(Schema)` before the handler
- [ ] Repository call — never direct data access in the handler
- [ ] `ApiResponse<T>` envelope on every response
- [ ] Correct HTTP status code (201 for creates, 200 for reads, 409 for conflicts)
- [ ] `AppError` thrown for all error cases — never `res.status().json()` directly
- [ ] Test file created at `src/routes/__tests__/[route].test.ts`

---

## Route Error Handling Pattern

```typescript
// Throw AppError — the global error handler catches and formats it
throw new AppError('Song not found', 404, 'NOT_FOUND');
throw new AppError('Already voted', 409, 'CONFLICT');
throw new AppError('Rate limit exceeded', 429, 'RATE_LIMITED');

// NEVER do this:
return res.status(404).json({ error: 'Not found' });  // ❌ bypasses envelope
```

## Rate Limiting Pattern

```typescript
import rateLimit from 'express-rate-limit';

// Apply to a single route
const voteLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute window
  max: 10,                   // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});

router.post('/api/v1/songs/:songId/vote', requireAuth, voteLimiter, validateBody(VoteSchema), handler);
```

---

## Repository Method Patterns

```typescript
// songRepo.ts — all methods follow this pattern
export const songRepo = {
  // Read — return T | null, never throw for missing
  findById(id: string): Song | null {
    return songs.find(s => s.id === id) ?? null;
  },

  // Create — always assign a new id, set timestamps
  create(input: Omit<Song, 'id' | 'createdAt'>): Song {
    const song: Song = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    songs.push(song);
    return song;
  },

  // Business logic enforcement (e.g., one vote per user)
  hasVoted(songId: string, userId: string): boolean {
    return votes.some(v => v.songId === songId && v.userId === userId);
  },
};
```

---

## Pagination Pattern (for list endpoints)

```typescript
const ListSongsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get('/api/v1/songs', (req, res) => {
  const { limit, offset } = ListSongsSchema.parse(req.query);
  const all = songRepo.getAll();
  const page = all.slice(offset, offset + limit);

  const response: ApiResponse<{ songs: Song[]; total: number }> = {
    data: { songs: page, total: all.length },
    error: null,
  };
  res.status(200).json(response);
});
```

---

## Complete Voting Endpoint Reference

A fully correct implementation — use this as a reference for generated code review:

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
