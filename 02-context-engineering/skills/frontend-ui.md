# Frontend UI Skill — VoteJam

> **How to use:** Reference this file in Copilot Chat with `#file:skills/frontend-ui.md` when building React components, hooks, or UI interactions. Gives Copilot deep frontend domain knowledge on top of the always-on `copilot-instructions.md`.

---

## When to Load This Skill

Load this file when:
- Adding a new React component
- Building a form or data-fetching hook
- Working on vote interactions or animations
- Styling with Tailwind

---

## Component Structure Pattern

```typescript
// Every component: typed props, named export, descriptive JSDoc
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
        <VoteButton direction="up" onClick={() => handleVote('up')} disabled={isVoting} />
        <span className="w-8 text-center font-bold text-gray-700">{song.votes}</span>
        <VoteButton direction="down" onClick={() => handleVote('down')} disabled={isVoting} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
```

---

## Data Fetching Pattern

```typescript
// Custom hook — all API calls go here, never in components directly
import { useState, useEffect, useCallback } from 'react';

interface UseSongsResult {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSongs(): UseSongsResult {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/songs');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? 'Failed to fetch songs');
      setSongs(body.data);
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
// Always match the backend ApiResponse envelope
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
// Update UI immediately, roll back on failure
const handleVote = async (songId: string, direction: 'up' | 'down') => {
  // 1. Save previous state
  const prev = songs;

  // 2. Optimistic update
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
    // 3. Roll back
    setSongs(prev);
    setError(err instanceof Error ? err.message : 'Vote failed');
  }
};
```

---

## Tailwind Design Tokens

VoteJam uses a consistent color system. Always use these classes:

| Element | Class |
|---------|-------|
| Card background | `bg-white border border-gray-100 rounded-xl shadow-sm` |
| Upvote button | `bg-green-50 text-green-600 hover:bg-green-100` |
| Downvote button | `bg-red-50 text-red-500 hover:bg-red-100` |
| Vote count | `font-bold text-gray-900` |
| Song title | `font-semibold text-gray-900 truncate` |
| Artist name | `text-sm text-gray-500` |
| Error message | `text-sm text-red-500` |
| Loading state | `animate-pulse bg-gray-100 rounded` |
| Primary action | `bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2` |

---

## Component Checklist

Before committing any component:

- [ ] Props are fully typed (no `any`)
- [ ] Loading state shown while fetching
- [ ] Error state handled and displayed
- [ ] Empty state handled (no results)
- [ ] Buttons disabled while async action is in progress
- [ ] API calls are in a custom hook or utility — not inline in JSX
- [ ] Optimistic updates on vote/mutation for perceived performance
- [ ] Keyboard accessible (buttons, not divs)
