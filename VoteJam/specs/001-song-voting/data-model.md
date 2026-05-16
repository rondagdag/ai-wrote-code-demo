# Data Model: Song Voting System

## Entities

### Song

Fields:
- `id: UUID` (primary key)
- `title: string` (1-200 chars)
- `artist: string` (1-200 chars)
- `submitted_by: string`
- `votes: integer` (derived aggregate)
- `created_at: timestamptz`
- `updated_at: timestamptz`

Validation rules:
- `id` must be valid UUID.
- `votes` should represent net score from stored votes.

Relationships:
- One-to-many with `Vote` through `votes.song_id`.

### Vote

Fields:
- `id: UUID` (primary key, default `gen_random_uuid()`)
- `song_id: UUID` (foreign key -> `songs.id`, `ON DELETE CASCADE`)
- `user_id: UUID or canonical user identifier`
- `direction: 'up' | 'down'`
- `created_at: timestamptz`
- `updated_at: timestamptz`

Validation rules:
- `song_id` must exist.
- `direction` constrained to enum `'up' | 'down'`.
- Unique key `(song_id, user_id)` enforces one active vote per user/song.

Indexes:
- `idx_votes_song_id` on `song_id`.
- Unique index on `(song_id, user_id)`.

Relationships:
- Many-to-one with `Song`.

## API Input/Output Models

### VoteRequest

Fields:
- `direction: 'up' | 'down'`

Validation rules:
- Required field.
- Must match enum.

### VoteResponseData

Fields:
- `songId: string`
- `votes: number`
- `userVote: 'up' | 'down' | null`

Validation rules:
- `songId` must be UUID string.
- `votes` must reflect post-operation aggregate.

## State Transitions

Vote state for a `(song_id, user_id)` pair:

1. `NO_VOTE` + `up` -> `UP`
2. `NO_VOTE` + `down` -> `DOWN`
3. `UP` + `up` -> `NO_VOTE` (toggle off)
4. `DOWN` + `down` -> `NO_VOTE` (toggle off)
5. `UP` + `down` -> `DOWN` (switch)
6. `DOWN` + `up` -> `UP` (switch)

Aggregate count effect (net score):
- Insert `UP`: `+1`
- Insert `DOWN`: `-1` (or clamped behavior if product rule requires non-negative)
- Toggle off `UP`: `-1`
- Toggle off `DOWN`: `+1`
- Switch `UP -> DOWN`: `-2`
- Switch `DOWN -> UP`: `+2`
