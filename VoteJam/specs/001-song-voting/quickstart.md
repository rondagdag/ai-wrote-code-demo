# Quickstart: Song Voting System

## Prerequisites

- Node.js 18+
- npm
- (Target implementation) PostgreSQL 14+ with `songs` and `votes` tables

## Install and Run

```bash
npm install
npm run dev
```

Server starts on the configured app port (default project setup uses port 3000).

## Run Tests

```bash
npm test
npm run build
```

## Exercise the Vote Endpoint

1. Create a song:

```bash
curl -s -X POST http://localhost:3000/api/v1/songs \
  -H "Authorization: Bearer testtoken123" \
  -H "Content-Type: application/json" \
  -d '{"title":"Blue in Green","artist":"Miles Davis"}'
```

2. Vote up:

```bash
curl -s -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Authorization: Bearer testtoken123" \
  -H "Content-Type: application/json" \
  -d '{"direction":"up"}'
```

3. Toggle off (same direction again):

```bash
curl -s -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Authorization: Bearer testtoken123" \
  -H "Content-Type: application/json" \
  -d '{"direction":"up"}'
```

4. Switch vote direction:

```bash
curl -s -X POST http://localhost:3000/api/v1/songs/<songId>/vote \
  -H "Authorization: Bearer testtoken123" \
  -H "Content-Type: application/json" \
  -d '{"direction":"down"}'
```

## Expected Error Cases

- Missing/invalid bearer token -> `401 UNAUTHORIZED`
- Invalid `songId` format -> `400` validation error
- Unknown `songId` -> `404 SONG_NOT_FOUND`
- Invalid `direction` value -> `400` validation error
- More than 10 vote changes/min/user -> `429 RATE_LIMITED`
