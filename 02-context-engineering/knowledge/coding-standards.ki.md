# VoteJam Coding Standards

> **For GitHub Copilot demo:** Copy this content into `.github/copilot-instructions.md`
> alongside content from `skills/backend-skill/SKILL.md` and `knowledge/api-patterns.ki.md`.

**Type:** Team Standards (used as GitHub Copilot custom instructions)
**Last Updated:** Nov 2025
**Maintained By:** VoteJam Team Lead

---

## Overview

These are the foundational coding standards that all team members and AI agents
must follow when contributing to VoteJam. This Knowledge Item survives across sessions,
ensuring consistent behavior even as the agent is restarted or new agents are added.

---

## Language & Type Safety

### TypeScript Configuration

- **Strict Mode:** Always enabled. `"strict": true` in `tsconfig.json`
- **Target:** ES2020 or higher
- **Module:** ESNext
- **No Implicit Any:** All variables must have explicit types
- **Strict Null Checks:** Required

```typescript
// WRONG — implicit any
const createSong = (data) => { ... };

// RIGHT — explicit types
const createSong = (data: CreateSongInput): Promise<Song> => { ... };
```

### Variable & Function Naming

- **Variables:** `camelCase` — `songId`, `userCount`, `isLoading`
- **Functions:** `camelCase` — `getUserById()`, `calculateTotal()`
- **Classes:** `PascalCase` — `SongRepository`, `ApiError`
- **Interfaces/Types:** `PascalCase` — `Song`, `UserProfile`, `CreateSongInput`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_TITLE_LENGTH`, `API_BASE_URL`
- **Private class members:** Prefix with `_` — `_internalCache`
- **Event handlers:** Prefix with `handle` — `handleClick()`, `handleSubmit()`

```typescript
// WRONG
const song_data = getSongData();
interface song { title: string; }
const MAX_VOTES = 1000; // Unclear what's "max" about

// RIGHT
const songData = getSongData();
interface Song { title: string; }
const MAX_SONG_VOTES = 1000;
```

### Imports Organization

Order imports as follows:

```typescript
// 1. External dependencies
import { Router, Request, Response } from 'express';
import { z } from 'zod';

// 2. Internal utilities
import { validateBody } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

// 3. Types
import type { Song, User } from '../types';

// 4. Local files
import { SongRepository } from '../repositories/songRepository';
import { AppError } from '../utils/errors';
```

---

## Component & Module Organization

### Single Responsibility Principle

- **One component per file** — `SongCard.tsx` contains only `SongCard`
- **One repository per resource** — `SongRepository` handles songs, `VoteRepository` handles votes
- **One hook per concern** — `useSongs()` for fetching, `useVote()` for voting

### File Structure

```
Backend:
  src/routes/              # Express route handlers
  src/repositories/        # Database access layer
  src/middleware/          # Express middleware
  src/utils/               # Shared utilities
  src/types/               # TypeScript definitions

Frontend:
  src/components/          # React components
  src/hooks/               # Custom hooks
  src/types/               # Frontend types
  src/utils/               # Shared utilities
```

---

## Code Quality Standards

### Error Handling

Always handle errors explicitly. Never silently fail.

```typescript
// WRONG — swallows error
try {
  await fetchSongs();
} catch (err) {
  // Ignore
}

// RIGHT — logs and re-throws
try {
  await fetchSongs();
} catch (err) {
  console.error('Failed to fetch songs:', err);
  throw new AppError('Could not load songs', 500);
}
```

### Comments & Documentation

- **What & Why:** Explain *why* code exists, not *what* it does
- **JSDoc for public APIs:** Document function params and return
- **TODO comments:** Use sparingly, link to issue tracker

```typescript
// WRONG — describes what the code does (obvious from reading)
// Loop through songs and get their vote count
songs.forEach((song) => console.log(song.votes));

// RIGHT — explains why this matters
// Pre-load vote counts to avoid N+1 queries on render
const songIds = songs.map((s) => s.id);
const voteCounts = await VoteRepository.getCountsByIds(songIds);
```

```typescript
/**
 * Get a song by ID, including vote counts.
 * @param songId - The unique song identifier
 * @returns The song object with current vote count, or null if not found
 * @throws {AppError} If database query fails
 */
export async function getSongWithVotes(songId: string): Promise<Song | null> {
  // ...
}
```

### No Magic Numbers

Always define constants with clear names.

```typescript
// WRONG
if (votes > 100) {
  notification.error('Vote limit exceeded');
}

// RIGHT
const MAX_VOTES_PER_HOUR = 100;
if (votes > MAX_VOTES_PER_HOUR) {
  notification.error(`You can only vote ${MAX_VOTES_PER_HOUR} times per hour`);
}
```

### Avoid Deep Nesting

Keep nesting shallow. Extract functions if needed.

```typescript
// WRONG — hard to follow
const result = await Promise.all(
  users.map(async (user) => {
    return await Promise.all(
      user.songs.map(async (song) => {
        return await getSongVotes(song.id);
      })
    );
  })
);

// RIGHT — clear intent
const getSongVotesForUser = async (userId: string) => {
  const user = await UserRepository.findById(userId);
  const songs = await SongRepository.findByUserId(userId);
  return Promise.all(songs.map((s) => VoteRepository.count(s.id)));
};
```

---

## Security Standards (Critical)

### Secrets & Environment Variables

NEVER hardcode secrets. Use environment variables for:
- API keys
- Database credentials
- JWT signing keys
- Third-party tokens

```typescript
// WRONG
const dbPassword = 'postgres123';
const apiKey = 'sk-1234567890abcdef';

// RIGHT
const dbPassword = process.env.DATABASE_PASSWORD;
const apiKey = process.env.OPENAI_API_KEY;

if (!dbPassword) {
  throw new Error('DATABASE_PASSWORD environment variable not set');
}
```

### SQL & Query Safety

ALWAYS use parameterized queries. NEVER string concatenation.

```typescript
// WRONG — SQL injection vulnerability
const query = `SELECT * FROM songs WHERE id = '${songId}'`;
const result = await pool.query(query);

// RIGHT — parameterized query
const result = await pool.query(
  `SELECT * FROM songs WHERE id = $1`,
  [songId]
);
```

### Input Validation

Validate all user input with Zod before processing.

```typescript
// WRONG — assumes input is safe
const title = req.body.title;
await SongRepository.create({ title });

// RIGHT — validates structure and content
const schema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
});

const { title, artist } = schema.parse(req.body);
await SongRepository.create({ title, artist });
```

### Authentication & Authorization

- All endpoints require `requireAuth` middleware unless explicitly public
- Check user identity before returning sensitive data
- Never leak internal error details to clients

```typescript
// WRONG — no auth check
router.get('/user/:userId', async (req, res) => {
  const user = await UserRepository.findById(req.params.userId);
  res.json(user); // Leaks data from other users
});

// RIGHT — auth + authorization
router.get('/me', requireAuth, async (req, res) => {
  const user = await UserRepository.findById(req.user.id);
  res.json(user); // User can only see themselves
});
```

---

## Testing Standards

### Coverage Requirements

- **Minimum 80% coverage** on all non-trivial code
- **100% coverage for security-critical code** (auth, validation, repos)
- **Three test types per feature:** happy path, error case, edge case

### Test Naming

```typescript
describe('POST /api/v1/songs', () => {
  it('creates a song with valid input', () => { ... });
  it('rejects missing title', () => { ... });
  it('prevents title longer than 200 chars', () => { ... });
});
```

Naming pattern: `it('[behavior] [given condition]')`

---

## Performance Expectations

### Database Queries

- N+1 queries are a bug. Use joins or pre-load related data
- Large result sets must be paginated (50 items default)
- Indexes on foreign keys and commonly filtered columns

```typescript
// WRONG — N+1 query
const songs = await SongRepository.findAll();
for (const song of songs) {
  const votes = await VoteRepository.getCount(song.id); // One query per song!
}

// RIGHT — batch operation
const songs = await SongRepository.findAll();
const voteCounts = await VoteRepository.getCountsByIds(
  songs.map((s) => s.id)
);
```

### Frontend Performance

- Components should re-render only when props/state change
- Memoize expensive calculations with `useMemo`
- Lazy-load routes with `React.lazy()`

---

## Accessibility Standards

All components must meet **WCAG 2.1 Level AA**:

- Semantic HTML (`<button>` not `<div>` with onClick)
- ARIA labels on interactive elements
- Keyboard navigation support
- 4.5:1 color contrast ratio minimum
- Focus indicators visible
- Form labels properly associated with inputs

---

## Code Review Checklist

Before submitting code for review, verify:

- [ ] TypeScript compiles with no errors (strict mode)
- [ ] Tests pass and coverage is above 80%
- [ ] No hardcoded secrets
- [ ] All queries are parameterized
- [ ] Error handling is explicit
- [ ] ARIA labels present (if frontend)
- [ ] No console.log() in production code
- [ ] Function/variable names are descriptive
- [ ] Comments explain *why*, not *what*
- [ ] No dead code or unused imports

---

## When These Standards Apply

These standards apply to **all** code contributions:
- Feature branches
- Pull requests
- Agent-generated code
- Pair programming sessions
- Code reviews

When GitHub Copilot (or any AI agent) generates code, it should follow these standards automatically.
If generated code violates these rules, it's a hint that the Backend-Skill or Frontend-Skill
needs to be updated.

---

## Questions?

If these standards feel unclear or impractical:
1. Ask in team standup
2. Open an issue with the tag `standards-clarification`
3. Update this document and get team approval before merging

This Knowledge Item is a living document. It evolves as the team's practices improve.
