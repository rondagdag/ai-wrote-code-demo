# Knowledge Item: VoteJam API Patterns & Security

**Type:** Persistent API Specifications
**Last Updated:** Nov 2025
**Maintained By:** API Team Lead

---

## Overview

This Knowledge Item documents the API design patterns, response formats, error handling,
and security rules that all VoteJam endpoints must follow. It survives across sessions,
ensuring the AI agent applies consistent patterns regardless of which endpoint is being built.

---

## API Versioning & Structure

### URL Format

All endpoints live under `/api/v1/`:

```
GET    /api/v1/songs
POST   /api/v1/songs
GET    /api/v1/songs/:songId
POST   /api/v1/songs/:songId/vote
```

Rationale: Version in URL allows multiple API versions to coexist during migration.

### HTTP Methods

- **GET** — Retrieve data (safe, idempotent)
- **POST** — Create resource (201 status)
- **PUT** — Replace entire resource (idempotent)
- **PATCH** — Partial update (not used in VoteJam yet)
- **DELETE** — Remove resource (204 status)

Never use GET for mutations (e.g., `/api/v1/songs/:id/delete` is wrong).

---

## Response Format (Standard Envelope)

**All endpoints** return this shape:

### Success Response (HTTP 200, 201, etc.)

```json
{
  "data": {
    "id": "song-123",
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "votes": 42,
    "createdAt": "2025-11-15T10:30:00Z"
  },
  "error": null
}
```

### Error Response (HTTP 400, 401, 500, etc.)

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be between 1 and 200 characters"
  }
}
```

### List Response with Pagination

```json
{
  "data": {
    "items": [
      { "id": "song-1", "title": "Song 1", ... },
      { "id": "song-2", "title": "Song 2", ... }
    ],
    "pagination": {
      "page": 1,
      "perPage": 50,
      "total": 124,
      "hasMore": true
    }
  },
  "error": null
}
```

**TypeScript interface:**

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: null | { code: string; message: string };
}

interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
}
```

---

## HTTP Status Codes

Use standard status codes appropriately:

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK — successful read | GET /api/v1/songs |
| **201** | Created — successful POST | POST /api/v1/songs |
| **204** | No Content — successful DELETE | DELETE /api/v1/songs/:id |
| **400** | Bad Request — validation error | Invalid input in request body |
| **401** | Unauthorized — auth required | Missing/invalid Authorization header |
| **403** | Forbidden — auth OK but not allowed | User tries to delete another user's song |
| **404** | Not Found — resource doesn't exist | GET /api/v1/songs/nonexistent |
| **409** | Conflict — business logic violation | User tries to vote twice on same song |
| **422** | Unprocessable Entity — semantic error | Valid format but logically invalid |
| **500** | Server Error — unexpected failure | Database crash, uncaught exception |

**Rule:** Never return 200 for an error. Use the appropriate error code.

```typescript
// WRONG
res.status(200).json({
  data: null,
  error: { code: 'NOT_FOUND', message: 'Song not found' },
});

// RIGHT
res.status(404).json({
  data: null,
  error: { code: 'NOT_FOUND', message: 'Song not found' },
});
```

---

## Error Codes (Client-Consumable)

These error codes are stable and documented for client developers:

| Code | HTTP Status | Example |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Missing required field, value out of range |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User doesn't have permission for action |
| `NOT_FOUND` | 404 | Resource (song, user) not found |
| `CONFLICT` | 409 | Business rule violated (duplicate vote) |
| `UNPROCESSABLE_ENTITY` | 422 | Semantic error (e.g., title too long after trim) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

```typescript
// Example error response
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "You have already voted on this song"
  }
}
```

---

## Authentication & Authorization

### Authentication Header

All protected endpoints require:

```
Authorization: Bearer <token>
```

**Example request:**

```bash
curl -X POST http://localhost:3000/api/v1/songs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"title": "New Song", "artist": "Artist Name"}'
```

### Public Endpoints (No Auth Required)

Currently **none**. All endpoints require auth by default.

If a new public endpoint is needed:
1. Document it clearly in code
2. Update this KI
3. Add test coverage for auth bypass

```typescript
// Mark public endpoints explicitly
const publicEndpoints = [
  // Currently empty — all endpoints require auth
];

// Example of future public endpoint:
// GET /api/v1/health — health check, no auth needed
router.get('/health', (req, res) => {
  res.json({ data: { status: 'ok' }, error: null });
});
```

### User Identification

The `requireAuth` middleware sets `req.user`:

```typescript
declare global {
  namespace Express {
    interface Request {
      user: { id: string };
    }
  }
}

// All route handlers can access req.user.id
router.post('/songs', requireAuth, async (req, res, next) => {
  const song = await SongRepository.create({
    ...req.body,
    submittedBy: req.user.id, // Always track who created this
  });
  res.status(201).json({ data: song, error: null });
});
```

---

## Request Validation

### Input Validation Pattern

Use Zod schemas at the route level:

```typescript
const createSongSchema = z.object({
  // Required fields
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),

  artist: z.string()
    .min(1, 'Artist is required')
    .max(200, 'Artist name must be 200 characters or less'),

  // Optional fields
  genre: z.string().optional(),

  // Enum validation
  status: z.enum(['draft', 'published']).default('draft'),
});

router.post(
  '/songs',
  requireAuth,
  validateBody(createSongSchema),
  async (req, res, next) => {
    // Input is guaranteed valid here
    const { title, artist, genre, status } = req.body;
    // ...
  }
);
```

### Parameterized Route Validation

Validate path parameters (`:songId`, etc.):

```typescript
const songIdSchema = z.object({
  songId: z.string().uuid('Invalid song ID format'),
});

router.get(
  '/songs/:songId',
  validateParams(songIdSchema),
  async (req, res, next) => {
    const { songId } = req.params; // Guaranteed to be valid UUID
    const song = await SongRepository.findById(songId);
    if (!song) {
      return res.status(404).json({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Song not found' },
      });
    }
    res.json({ data: song, error: null });
  }
);
```

---

## Security Rules (Non-Negotiable)

### 1. Never Trust User Input

Always validate and sanitize:

```typescript
// WRONG
const title = req.body.title;
await SongRepository.create({ title }); // What if title is undefined? An array? HTML?

// RIGHT
const schema = z.object({
  title: z.string().min(1).max(200).trim(),
});
const { title } = schema.parse(req.body); // Guaranteed valid string
```

### 2. Parameterized Queries Only

SQL injection protection is non-negotiable:

```typescript
// WRONG — SQL injection vulnerability
const query = `SELECT * FROM songs WHERE id = '${songId}'`;
await pool.query(query);

// RIGHT
await pool.query('SELECT * FROM songs WHERE id = $1', [songId]);
```

### 3. No Hardcoded Secrets

Environment variables for all secrets:

```typescript
// WRONG
const dbPassword = 'prod-password-123';
const jwtSecret = 'my-secret-key';

// RIGHT
const dbPassword = process.env.DATABASE_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;

if (!dbPassword || !jwtSecret) {
  throw new Error('Missing required environment variables');
}
```

### 4. Authorization Checks

Verify user owns the resource before allowing modification:

```typescript
router.delete('/songs/:songId', requireAuth, async (req, res, next) => {
  const { songId } = req.params;
  const song = await SongRepository.findById(songId);

  if (!song) {
    return res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Song not found' },
    });
  }

  // CRITICAL: Check user ownership
  if (song.submittedBy !== req.user.id) {
    return res.status(403).json({
      data: null,
      error: { code: 'FORBIDDEN', message: 'You can only delete your own songs' },
    });
  }

  await SongRepository.delete(songId);
  res.status(204).send();
});
```

### 5. Rate Limiting

Server-side rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for voting
const voteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 votes per minute
});

app.use('/api/v1/', apiLimiter);
router.post('/songs/:songId/vote', voteLimiter, requireAuth, async (req, res) => {
  // Vote endpoint
});
```

---

## Data Types

### Song Object

```typescript
interface Song {
  id: string; // UUID
  title: string; // 1-200 chars
  artist: string; // 1-200 chars
  votes: number; // >= 0
  submittedBy: string; // User ID who created it
  createdAt: string; // ISO 8601 timestamp
  updatedAt?: string; // Optional, if modified
}
```

### Vote Object

```typescript
interface Vote {
  id: string; // UUID
  songId: string; // Reference to Song
  userId: string; // User who voted
  direction: 'up' | 'down';
  createdAt: string; // When vote was cast
}
```

---

## Common Endpoints (Template)

### Create Song

```
POST /api/v1/songs
Authorization: Bearer <token>

Request Body:
{
  "title": "Song Title",
  "artist": "Artist Name"
}

Success Response (201):
{
  "data": {
    "id": "song-uuid",
    "title": "Song Title",
    "artist": "Artist Name",
    "votes": 0,
    "submittedBy": "user-uuid",
    "createdAt": "2025-11-15T10:30:00Z"
  },
  "error": null
}

Error Response (400):
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

### Get All Songs

```
GET /api/v1/songs?page=1&perPage=50
Authorization: Bearer <token>

Success Response (200):
{
  "data": {
    "items": [
      { "id": "...", "title": "...", ... },
      ...
    ],
    "pagination": {
      "page": 1,
      "perPage": 50,
      "total": 124,
      "hasMore": true
    }
  },
  "error": null
}
```

### Vote on Song

```
POST /api/v1/songs/:songId/vote
Authorization: Bearer <token>

Request Body:
{
  "direction": "up"
}

Success Response (200):
{
  "data": {
    "voteCount": 43
  },
  "error": null
}

Error Response (409):
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "You have already voted on this song"
  }
}
```

---

## Testing API Endpoints

Every endpoint must have tests covering:

1. **Happy path** — Valid input, successful response
2. **Auth failure** — Missing/invalid token → 401
3. **Validation failure** — Invalid input → 400
4. **Business logic failure** — Conflict/constraint violation → 409
5. **Not found** — Resource doesn't exist → 404

```typescript
describe('POST /api/v1/songs/:songId/vote', () => {
  it('allows user to vote on song', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.data.voteCount).toBe(1);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .send({ direction: 'up' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('prevents duplicate vote from same user', async () => {
    // First vote succeeds
    await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ direction: 'up' });

    // Second vote fails
    const res = await request(app)
      .post('/api/v1/songs/song-123/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ direction: 'down' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
```

---

## Common Pitfalls to Avoid

1. **Returning 200 for errors** — Use appropriate status codes
2. **Trusting unvalidated input** — Always validate with Zod
3. **String concatenation in queries** — Always parameterized queries
4. **Leaking sensitive data in errors** — Generic messages only
5. **Forgetting auth checks** — All endpoints protected by default
6. **N+1 queries** — Batch load related data
7. **No rate limiting** — Protect against abuse
8. **No error handling** — Always try/catch and pass to error middleware

---

## When These Patterns Apply

Every API endpoint in VoteJam must follow these patterns:
- Consistent response format
- Proper HTTP status codes
- Standard error codes
- Input validation
- Authentication checks
- Security rules

When Antigravity generates endpoints, it should automatically apply these patterns.
If generated endpoints violate these rules, it's a hint that this KI or the Backend-Skill
needs to be updated.

---

## Questions or Clarifications?

1. Ask in the API team standup
2. Open an issue with the tag `api-patterns-question`
3. Update this document with team approval before merging

This Knowledge Item is maintained by the API team and evolves with the codebase.
