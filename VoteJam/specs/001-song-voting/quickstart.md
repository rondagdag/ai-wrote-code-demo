# Quickstart: Song Voting System

**Feature**: `001-song-voting` | **Date**: 2026-04-20

Get the vote endpoint running locally in under 5 minutes.

---

## Prerequisites

- Node.js 20+ (`node --version`)
- npm 9+ (`npm --version`)

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Run Tests (Red Phase First — TDD)

Per the constitution, verify tests fail before any implementation:

```bash
npm test
```

Expected: `votes.test.ts` scenarios that test unimplemented toggle behavior and the
correct response shape will fail. This is correct — Red-Green TDD is in effect.

---

## 3. Start the Dev Server

```bash
npm run dev
# or: npx ts-node src/app.ts
```

Server starts on `http://localhost:3000`.

---

## 4. Create a Song (required before voting)

```bash
curl -X POST http://localhost:3000/api/v1/songs \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Bohemian Rhapsody", "artist": "Queen"}'
```

Copy the `id` from the response — you need it to vote.

---

## 5. Vote on the Song

```bash
# Upvote
curl -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Authorization: Bearer voter-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'
```

Expected response:
```json
{
  "data": {
    "songId": "<songId>",
    "votes": 1,
    "userVote": "up"
  },
  "error": null
}
```

---

## 6. Toggle the Vote Off (same direction)

```bash
curl -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Authorization: Bearer voter-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'
```

Expected response (`userVote: null`, votes back to 0):
```json
{
  "data": {
    "songId": "<songId>",
    "votes": 0,
    "userVote": null
  },
  "error": null
}
```

---

## 7. Test Error Paths

```bash
# 401 — no token
curl -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'

# 400 — invalid direction
curl -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Authorization: Bearer voter-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "sideways"}'

# 400 — invalid UUID param
curl -X POST http://localhost:3000/api/v1/songs/not-a-uuid/vote \
  -H "Authorization: Bearer voter-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'

# 404 — song doesn't exist
curl -X POST http://localhost:3000/api/v1/songs/00000000-0000-0000-0000-000000000000/vote \
  -H "Authorization: Bearer voter-token" \
  -H "Content-Type: application/json" \
  -d '{"direction": "up"}'
```

---

## Key Files to Implement

| File | Change |
|------|--------|
| `src/types/VoteResponse.ts` | **Create** — `VoteResponse` interface |
| `src/repositories/songRepo.ts` | **Update** — replace `hasUserVoted`/`recordVote` with `vote()`; fix `songVoters` type |
| `src/routes/songs.ts` | **Update** — fix duplicate import, rate limit to 10, UUID param validation, use `vote()` |

See [plan.md](plan.md) → "Known Issues in Existing Code" for the full list of bugs to fix.

---

## Run Full Test Suite

```bash
npm test
```

All tests in `src/routes/__tests__/votes.test.ts` and `src/routes/__tests__/songs.test.ts`
should pass after implementation. Target: >90% branch coverage on route and repository logic.
