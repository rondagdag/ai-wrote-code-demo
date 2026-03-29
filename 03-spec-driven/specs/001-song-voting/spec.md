# Feature Spec: Song Voting System

## Overview
Users can upvote or downvote songs in the VoteJam playlist.
Votes are tracked per-user to prevent duplicate voting.

---

## Interface Contract

### API Endpoint
```
POST /api/v1/songs/:songId/vote
```

### Request
```typescript
interface VoteRequest {
  direction: 'up' | 'down';
}
```

### Response (200 OK)
```typescript
interface VoteResponse {
  data: {
    songId: string;
    votes: number;       // Updated total
    userVote: 'up' | 'down' | null;  // Current user's vote
  };
  error: null;
}
```

### Error Responses
| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | No valid auth token |
| 404 | `SONG_NOT_FOUND` | songId doesn't exist |
| 429 | `RATE_LIMITED` | More than 10 vote changes per minute |

### Database Schema
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  direction VARCHAR(4) NOT NULL CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(song_id, user_id)
);

CREATE INDEX idx_votes_song_id ON votes(song_id);
```

---

## Acceptance Criteria

1. **Vote recorded**: POST with valid token and direction returns 200
   with updated vote count
2. **Vote toggled**: If user already voted in same direction, vote is
   removed (toggle off). If different direction, vote is changed.
3. **One vote per song**: UNIQUE constraint on (song_id, user_id)
   enforced at DB level, not just application level
4. **Auth required**: Returns 401 without valid bearer token
5. **Song must exist**: Returns 404 for non-existent songId
6. **Rate limited**: Server-side rate limit of 10 vote changes/min/user
7. **Vote count accurate**: `songs.votes` column updated via DB trigger
   or materialized count, not application-level counter

---

## Constraints

### Security
- All votes must be authenticated (bearer token)
- Rate limiting MUST be server-side (not client-side)
- Use parameterized queries for all database operations
- songId must be validated as UUID format before DB query

### Performance
- Vote endpoint must respond in < 200ms (p95)
- Vote count updates must be eventually consistent within 1 second
- Index on song_id for efficient count queries

### Dependencies
- Express.js route handler
- Zod for request validation
- PostgreSQL with the `votes` table
- Auth middleware (existing `requireAuth`)
- Rate limiter middleware (existing `rateLimit`)

---

## Non-Goals

- Real-time WebSocket updates (future spec)
- Vote history or analytics dashboard (future spec)
- Anonymous voting (explicitly not supported)
- Batch voting (one vote per request only)

---

## Test Scenarios

### Happy Path
1. Authenticated user upvotes a song → 200, votes +1
2. User changes vote from up to down → 200, votes -2 (net)
3. User removes vote by voting same direction → 200, votes -1

### Edge Cases
4. Unauthenticated request → 401
5. Non-existent songId → 404
6. Invalid direction value ("sideways") → 400 validation error
7. Invalid songId format ("not-a-uuid") → 400 validation error
8. Rapid voting (>10/min) → 429 after threshold
9. Concurrent votes on same song → correct count (no race condition)
10. Vote on deleted song → 404 (CASCADE handles cleanup)
