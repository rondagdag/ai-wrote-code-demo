# API Contract: Vote on a Song

**Endpoint**: `POST /api/v1/songs/:songId/vote`  
**Feature**: `001-song-voting` | **Version**: 1.0.0 | **Date**: 2026-04-20

---

## Overview

Cast, change, or remove a vote on a song. Votes have toggle semantics:
- Same direction as the user's existing vote → removes the vote
- Opposite direction from the user's existing vote → changes the vote
- No existing vote → creates the vote

---

## Authentication

All requests must include a valid Bearer token:

```
Authorization: Bearer <token>
```

Missing or malformed token returns `401 UNAUTHORIZED`.

---

## Request

### Path Parameters

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `songId` | UUID string | Yes | Must be a valid UUID v4 format |

Invalid UUID format → `400 VALIDATION_ERROR` (before any DB/repo lookup).

### Request Body

```json
{
  "direction": "up"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `direction` | string | Yes | `"up"` or `"down"` |

Any other value → `400 VALIDATION_ERROR`.

### Headers

| Header | Required | Value |
|--------|----------|-------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer <token>` |

---

## Responses

### 200 OK — Vote recorded, changed, or removed

```json
{
  "data": {
    "songId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "votes": 42,
    "userVote": "up"
  },
  "error": null
}
```

`userVote` is `null` when the vote was toggled off (user voted in the same direction twice).

```json
{
  "data": {
    "songId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "votes": 41,
    "userVote": null
  },
  "error": null
}
```

### 400 Bad Request — Validation error

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid enum value. Expected 'up' | 'down', received 'sideways'"
  }
}
```

Triggers:
- `direction` field missing or not `"up"`/`"down"`
- `songId` param is not a valid UUID

### 401 Unauthorized — Missing or invalid token

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

### 404 Not Found — Song does not exist

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Song not found"
  }
}
```

Note: `SONG_NOT_FOUND` is not used; the approved error code is `NOT_FOUND` (see constitution V).

### 429 Too Many Requests — Rate limit exceeded

```json
{
  "data": null,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many vote requests"
  }
}
```

Limit: 10 vote changes per minute per authenticated user. Resets after the 60-second window.

---

## Rate Limiting

- **Limit**: 10 requests/minute
- **Window**: 60 seconds (rolling)
- **Key**: Authenticated user ID (`req.user.id`)
- **Headers returned**: `RateLimit-*` standard headers

---

## TypeScript Interface

```typescript
// Request
interface VoteRequest {
  direction: 'up' | 'down';
}

// Response data shape (src/types/VoteResponse.ts)
interface VoteResponse {
  songId: string;
  votes: number;
  userVote: 'up' | 'down' | null;
}

// Wrapped in ApiResponse envelope
type VoteApiResponse = ApiResponse<VoteResponse>;
// { data: VoteResponse, error: null }  — success
// { data: null, error: { code: string, message: string } }  — error
```

---

## Example cURL

```bash
# Cast an upvote
curl -X POST http://localhost:3000/api/v1/songs/3fa85f64-5717-4562-b3fc-2c963f66afa6/vote \
  -H "Authorization: Bearer my-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'

# Toggle off (same direction again)
curl -X POST http://localhost:3000/api/v1/songs/3fa85f64-5717-4562-b3fc-2c963f66afa6/vote \
  -H "Authorization: Bearer my-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'
# → userVote: null, votes decremented by 1
```
