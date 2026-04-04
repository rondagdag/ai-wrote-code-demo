---
name: frontend-ui
description: >
  Frontend React/TypeScript patterns for VoteJam's UI layer.
  Use when building components, hooks, forms, API calls from the client,
  or vote interactions with optimistic updates.
  Activates automatically when working on src/components/, src/hooks/,
  src/pages/, or any .tsx file.
allowed-tools:
  - read_file
  - write_file
---

# Frontend UI Skill — VoteJam

This skill loads automatically when Copilot detects frontend/React work. It provides deep UI patterns on top of the always-on `.github/copilot-instructions.md`.

---

## Component Checklist

Before committing any component:

- [ ] Props fully typed — no `any`
- [ ] Loading state shown while fetching
- [ ] Error state handled and displayed to user
- [ ] Empty state handled (no data case)
- [ ] Buttons disabled while async action is in progress
- [ ] API calls in a custom hook — not inline in JSX
- [ ] Optimistic updates on vote/mutation for perceived performance
- [ ] Keyboard accessible — use `<button>`, not `<div onClick>`

---

## Component Structure

```typescript
import { useState } from 'react';

interface SongCardProps {
  song: Song;
  currentUserId: string;
  onVote: (songId: string, direction: 'up' | 'down') => Promise<void>;
}

export function SongCard({ song, currentUserId, onVote }: SongCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    setIsVoting(true);
    setError(null);
    try {
      await onVote(song.id, direction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{song.title}</p>
        <p className="text-sm text-gray-500 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleVote('up')}
          disabled={isVoting}
          className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-lg disabled:opacity-50"
        >
          ▲
        </button>
        <span className="w-8 text-center font-bold text-gray-700">{song.votes}</span>
        <button
          onClick={() => handleVote('down')}
          disabled={isVoting}
          className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-lg disabled:opacity-50"
        >
          ▼
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
```

---

## Data Fetching Hook Pattern

```typescript
// All API calls go in custom hooks — never fetch directly inside components
import { useState, useEffect, useCallback } from 'react';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/songs');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? 'Failed to fetch');
      setSongs(body.data.songs ?? body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  return { songs, isLoading, error, refetch: fetchSongs };
}
```

---

## API Call Pattern

```typescript
// Always match the backend ApiResponse<T> envelope
async function castVote(songId: string, direction: 'up' | 'down', token: string): Promise<Vote> {
  const res = await fetch(`/api/v1/songs/${songId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ direction }),
  });

  const body = await res.json();
  if (!res.ok) {
    // Map API error codes to user-friendly messages
    const messages: Record<string, string> = {
      UNAUTHORIZED: 'Please log in to vote',
      CONFLICT: 'You already voted on this song',
      RATE_LIMITED: 'Slow down — too many votes!',
    };
    throw new Error(messages[body.error?.code] ?? body.error?.message ?? 'Vote failed');
  }

  return body.data;
}
```

---

## Optimistic Update Pattern

```typescript
const handleVote = async (songId: string, direction: 'up' | 'down') => {
  const prev = songs;

  // Optimistic: update immediately for perceived performance
  setSongs(s =>
    s.map(song =>
      song.id === songId
        ? { ...song, votes: song.votes + (direction === 'up' ? 1 : -1) }
        : song
    )
  );

  try {
    await castVote(songId, direction, authToken);
  } catch (err) {
    // Roll back on failure
    setSongs(prev);
    setError(err instanceof Error ? err.message : 'Vote failed');
  }
};
```

---

## Tailwind Design Tokens

| Element | Class |
|---------|-------|
| Card | `bg-white border border-gray-100 rounded-xl shadow-sm` |
| Upvote button | `bg-green-50 text-green-600 hover:bg-green-100` |
| Downvote button | `bg-red-50 text-red-500 hover:bg-red-100` |
| Vote count | `font-bold text-gray-900` |
| Song title | `font-semibold text-gray-900 truncate` |
| Artist | `text-sm text-gray-500` |
| Error | `text-sm text-red-500` |
| Loading skeleton | `animate-pulse bg-gray-100 rounded` |
| Primary button | `bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2` |
