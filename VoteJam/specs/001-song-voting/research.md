# Research: Song Voting System

**Feature**: `001-song-voting` | **Date**: 2026-04-20

All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## 1. Vote Toggle Semantics

**Decision**: Implement upsert-style toggle at the repository layer.

| User action | Current state | Outcome | Net vote change |
|-------------|--------------|---------|----------------|
| Vote `up` | No vote | Insert `up` | +1 |
| Vote `up` | Voted `up` | Remove vote | -1 |
| Vote `up` | Voted `down` | Change to `up` | +2 |
| Vote `down` | No vote | Insert `down` | -1 |
| Vote `down` | Voted `down` | Remove vote | +1 |
| Vote `down` | Voted `up` | Change to `down` | -2 |

**Rationale**: Spec acceptance criteria §2 states "If user already voted in same direction, vote is removed (toggle off). If different direction, vote is changed." This maps directly to a single `vote(songId, userId, direction)` method in the repository that returns the new state.

**Alternatives considered**:
- Separate `addVote`/`removeVote`/`changeVote` methods — rejected; adds route-handler logic that belongs in the repository (constitution II).
- Optimistic client-side state with eventual consistency — rejected; spec requires server-authoritative vote count.

---

## 2. Response Shape for Vote Endpoint

**Decision**: Introduce a dedicated `VoteResponse` type in `src/types/VoteResponse.ts`.

```typescript
export interface VoteResponse {
  songId: string;
  votes: number;       // Updated total after the operation
  userVote: 'up' | 'down' | null;  // null when vote was toggled off
}
```

**Rationale**: The spec interface contract specifies this exact shape — it is narrower than the full `Song` object (excludes `title`, `artist`, `submittedBy`, `createdAt`). Returning a full `Song` would leak fields not needed by the vote response and couple the vote contract to the song schema.

**Alternatives considered**:
- Return full `Song` + `userVote` field — rejected; bloats the response and mixes concerns.
- Extend `Song` type with optional `userVote` — rejected; `userVote` is context-dependent (varies per requesting user), making it wrong to store on the entity.

---

## 3. UUID Validation for Route Params

**Decision**: Parse `req.params.songId` with `z.string().uuid()` inside the route handler before any repository call, throwing `VALIDATION_ERROR` on invalid format.

```typescript
const songId = z.string().uuid().safeParse(req.params.songId);
if (!songId.success) {
  throw new AppError('Invalid song ID format', 400, 'VALIDATION_ERROR');
}
```

**Rationale**: Constitution III requires UUID format to be validated before any repository query. `validateBody` only covers `req.body`; param schemas need explicit in-handler validation until a `validateParams` middleware is added (out of scope for this feature).

**Alternatives considered**:
- `validateParams` middleware (like `validateBody`) — valid future improvement but out of scope; inline parsing is simpler for a single param.
- Trust the repo to return `undefined` for non-UUID lookups — rejected; violates constitution III and leaks storage implementation details.

---

## 4. Rate Limit Configuration

**Decision**: Use `express-rate-limit` with `windowMs: 60_000`, `max: 10`, keyed by `req.user.id`.

**Rationale**: Spec §Rate limited states "Server-side rate limit of 10 vote changes/min/user." The existing code has `max: 5` which must be corrected. The key generator uses `req.user!.id` (guaranteed by `requireAuth` running first in the middleware chain) — this prevents per-IP limiting which would affect users behind NAT.

**Alternatives considered**:
- Per-IP rate limiting — rejected; breaks shared NAT environments and ignores the per-user requirement.
- Redis-backed distributed rate limiting — valid for multi-instance deployments but out of scope; in-memory `express-rate-limit` default store is sufficient for single-instance party-scale use.

---

## 5. Error Code Alignment

**Decision**: Use `NOT_FOUND` (not `SONG_NOT_FOUND`) for missing song errors.

**Rationale**: Constitution V defines the approved error code set: `UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`. The spec's interface table uses `SONG_NOT_FOUND` which is not in the approved set. Constitution supersedes the spec on error codes.

**Alternatives considered**:
- Add `SONG_NOT_FOUND` to the approved set — requires a constitution amendment (PATCH version bump); out of scope for this feature.

---

## 6. Vote Direction Storage in Repository

**Decision**: Change `songVoters: Map<string, Set<string>>` to `songVoters: Map<string, Map<string, 'up' | 'down'>>` to store direction per user, enabling toggle logic.

**Rationale**: The existing `Set<string>` only tracks whether a user voted, not which direction. Toggle semantics require knowing the current direction. This is an internal repository detail — no route changes needed.

**Alternatives considered**:
- Separate maps for up-voters and down-voters — rejected; makes toggle logic more complex.
- Store direction on the `Song` entity — rejected; vote state is per-user, not per-song.

---

## All Unknowns Resolved

No items remain as NEEDS CLARIFICATION. Implementation can proceed to Phase 1.
