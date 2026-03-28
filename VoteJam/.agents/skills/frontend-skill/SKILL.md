# Frontend Development Skill — VoteJam

## Purpose
This Skill equips the Antigravity agent with frontend development patterns,
accessibility standards, and React best practices for the VoteJam UI.
Automatically loads when working in `src/components/`, `src/hooks/`, or styling files.

---

## Tech Stack
- **Framework:** React 18+ (with Vite)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + `cn()` utility
- **State Management:** React hooks for local state, TanStack Query for server state
- **Testing:** Vitest + React Testing Library
- **Accessibility:** WCAG 2.1 Level AA

---

## Project Structure
```
src/
  components/       # Reusable React components (one per file)
  hooks/            # Custom React hooks (use* prefix)
  types/            # TypeScript interfaces for frontend
  App.tsx           # Root component
  main.tsx          # Entry point
```

---

## Core Patterns

### 1. Component Structure

All components follow this pattern:

```typescript
import { useState } from 'react';
import type { Song } from '../types/song';

/**
 * SongCard displays a single song with voting controls.
 * @param song - Song data to display
 * @param onVote - Callback when user votes
 */
interface SongCardProps {
  song: Song;
  onVote: (songId: string, direction: 'up' | 'down') => Promise<void>;
}

export function SongCard({ song, onVote }: SongCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (direction: 'up' | 'down') => {
    setIsVoting(true);
    try {
      await onVote(song.id, direction);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      {/* Component content */}
    </div>
  );
}
```

**Rules:**
- Component name matches filename: `SongCard` in `SongCard.tsx`
- Props interface named `ComponentNameProps` — `SongCardProps` for `SongCard`
- JSDoc comment at the top explaining purpose and props
- Use `export function` (not `export default`)
- One component per file
- Functional components with hooks only (no class components)

---

### 2. Props Pattern

Props are always strongly typed with interfaces:

```typescript
interface ButtonProps {
  // Content
  children: React.ReactNode;

  // Behavior
  onClick: () => void | Promise<void>;
  disabled?: boolean;

  // Styling
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className,
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 font-medium rounded transition-colors';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
}
```

**Rules:**
- Use TypeScript interfaces for props (not inline types)
- Document prop purposes with comments (Content, Behavior, Styling sections)
- Provide sensible defaults with `= defaultValue`
- Always include optional props with `?`
- Never use `any` type

---

### 3. Custom Hooks

Custom hooks handle complex state or side-side logic:

```typescript
// src/hooks/useSongs.ts
import { useState, useEffect } from 'react';
import type { Song } from '../types/song';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/songs');
        if (!res.ok) throw new Error('Failed to fetch songs');
        const { data } = await res.json();
        setSongs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return { songs, loading, error };
}

// Usage in component
export function SongList() {
  const { songs, loading, error } = useSongs();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {songs.map((song) => (
        <SongCard key={song.id} song={song} onVote={handleVote} />
      ))}
    </div>
  );
}
```

**Rules:**
- Hook name starts with `use` — `useSongs`, `useVote`, `useTheme`
- Hooks go in `src/hooks/` directory
- Keep hooks focused on one responsibility
- Return an object with clearly named properties
- Handle loading and error states explicitly

---

## Styling with Tailwind CSS

All styling uses Tailwind utility classes. No CSS files needed.

```typescript
import { cn } from '../utils/cn'; // Helper function

export function SongCard({ song, onVote }: SongCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Vote buttons column */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => handleVote('up')}
          disabled={isVoting}
          className={cn(
            'text-2xl transition-colors',
            isVoting && 'opacity-50 cursor-not-allowed',
            !isVoting && 'hover:text-green-600'
          )}
          aria-label={`Upvote: ${song.title}`}
        >
          ▲
        </button>

        <span className="text-lg font-bold tabular-nums">
          {song.votes}
        </span>

        <button
          onClick={() => handleVote('down')}
          disabled={isVoting}
          className={cn(
            'text-2xl transition-colors',
            isVoting && 'opacity-50 cursor-not-allowed',
            !isVoting && 'hover:text-red-600'
          )}
          aria-label={`Downvote: ${song.title}`}
        >
          ▼
        </button>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {song.title}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {song.artist}
        </p>
      </div>
    </div>
  );
}
```

**Tailwind rules:**
- Use utility classes: `p-4`, `text-xl`, `hover:bg-blue-600`
- Use `cn()` helper for conditional classes
- Mobile-first: base styles, then `md:` and `lg:` breakpoints
- Color palette: Use team colors from `tailwind.config.ts`
- Spacing: `gap-4`, `p-4` not custom pixels
- Typography: Use semantic sizes (`text-sm`, `text-lg`, `text-xl`)

---

## Accessibility Standards (WCAG 2.1 Level AA)

### 1. Semantic HTML

```typescript
// WRONG
<div onClick={handleSubmit} className="button">
  Submit
</div>

// RIGHT
<button onClick={handleSubmit} type="button">
  Submit
</button>
```

Use semantic tags: `<button>`, `<a>`, `<form>`, `<main>`, `<nav>`, `<section>`, etc.

### 2. ARIA Labels

Interactive elements must have accessible names:

```typescript
export function VoteButton({ direction, onClick }: VoteButtonProps) {
  return (
    <button
      onClick={onClick}
      // Descriptive label for screen readers
      aria-label={
        direction === 'up'
          ? `Upvote: ${song.title} by ${song.artist}`
          : `Downvote: ${song.title} by ${song.artist}`
      }
      className="..."
    >
      {direction === 'up' ? '▲' : '▼'}
    </button>
  );
}
```

**ARIA rules:**
- `aria-label` on icon buttons (no visible text)
- `aria-describedby` for additional context
- `aria-disabled="true"` for disabled state (along with `disabled` attribute)
- `role="alert"` for dynamically updated messages
- `aria-live="polite"` for live regions

### 3. Keyboard Navigation

All interactive elements must work with keyboard:

```typescript
export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Search songs..."
      aria-label="Search songs by title or artist"
    />
  );
}
```

### 4. Color Contrast

All text must have at least 4.5:1 contrast ratio (WCAG AA standard):

```typescript
// WRONG — light gray on white (not enough contrast)
<div className="text-gray-300 bg-white">Text</div>

// RIGHT — darker gray on white
<div className="text-gray-700 bg-white">Text</div>
```

Use the color palette defined in `tailwind.config.ts` which has been tested for contrast.

### 5. Form Labels

All inputs must have associated labels:

```typescript
// WRONG
<input type="text" placeholder="Title" />

// RIGHT
<div>
  <label htmlFor="song-title">Song Title</label>
  <input
    id="song-title"
    type="text"
    required
    aria-describedby="title-help"
  />
  <p id="title-help" className="text-sm text-gray-600">
    Maximum 200 characters
  </p>
</div>
```

---

## State Management

### Local Component State

Use `useState` for simple, local state:

```typescript
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

### Custom Hooks for Complex State

Use custom hooks when state logic is reusable:

```typescript
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

### Server State (TanStack Query)

Use TanStack Query for API data:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

export function SongList() {
  // Fetch songs
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/songs');
      return res.json();
    },
  });

  // Vote mutation
  const votesMutation = useMutation({
    mutationFn: async (payload: { songId: string; direction: 'up' | 'down' }) => {
      const res = await fetch(`/api/v1/songs/${payload.songId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: payload.direction }),
      });
      if (!res.ok) throw new Error('Vote failed');
      return res.json();
    },
    onSuccess: () => {
      // Refetch songs after vote
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          onVote={async (songId, direction) => {
            await votesMutation.mutateAsync({ songId, direction });
          }}
        />
      ))}
    </div>
  );
}
```

---

## Testing

Test components with React Testing Library:

```typescript
// src/components/__tests__/SongCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SongCard } from '../SongCard';
import type { Song } from '../../types/song';

describe('SongCard', () => {
  const mockSong: Song = {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    votes: 42,
    submittedBy: 'user-1',
    createdAt: new Date().toISOString(),
  };

  it('renders song title and artist', () => {
    render(
      <SongCard song={mockSong} onVote={() => Promise.resolve()} />
    );

    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('Queen')).toBeInTheDocument();
  });

  it('calls onVote with correct direction when upvote clicked', async () => {
    const user = userEvent.setup();
    const mockVote = vi.fn(() => Promise.resolve());

    render(<SongCard song={mockSong} onVote={mockVote} />);

    const upvoteButton = screen.getByLabelText(/upvote/i);
    await user.click(upvoteButton);

    expect(mockVote).toHaveBeenCalledWith(mockSong.id, 'up');
  });

  it('disables buttons while voting', async () => {
    const user = userEvent.setup();
    const mockVote = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(), 100)
        )
    );

    render(<SongCard song={mockSong} onVote={mockVote} />);

    const upvoteButton = screen.getByLabelText(/upvote/i);
    await user.click(upvoteButton);

    expect(upvoteButton).toBeDisabled();
  });
});
```

**Test coverage minimum:**
- Component renders correctly
- Props are displayed
- User interactions trigger callbacks
- Loading/disabled states work
- Accessibility attributes are present

---

## Naming Conventions

- **Component files:** `PascalCase.tsx` — `SongCard.tsx`, `VoteButton.tsx`
- **Component names:** `PascalCase` — `SongCard`, `VoteButton`
- **Props interfaces:** `ComponentNameProps` — `SongCardProps`
- **Hook files:** `useCamelCase.ts` — `useSongs.ts`, `useVote.ts`
- **Hook names:** `useCamelCase` — `useSongs()`, `useVote()`
- **Variables/functions:** `camelCase` — `handleVote`, `songList`
- **CSS classes:** `lowercase-with-hyphens` (Tailwind standard)
- **Event handlers:** `handle{Action}` — `handleVote`, `handleSubmit`

---

## File Checklist

When adding a new component:

- [ ] Component file in `src/components/` with correct naming
- [ ] Props interface with clear types
- [ ] JSDoc comment explaining purpose
- [ ] Tailwind styling (no CSS files)
- [ ] ARIA labels for accessibility
- [ ] Test file in `src/components/__tests__/`
- [ ] Type definitions in `src/types/` (if needed)
- [ ] Custom hooks in `src/hooks/` (if extracting state)

---

## Quick Reference

| Need | Pattern |
|------|---------|
| New component | `src/components/ComponentName.tsx` + props interface + tests |
| Component state | `useState()` hook |
| Shared state logic | Custom hook in `src/hooks/` |
| API data | TanStack Query with `useQuery`/`useMutation` |
| Styling | Tailwind classes + `cn()` for conditionals |
| Accessibility | Semantic HTML + aria-labels |
| Testing | React Testing Library + Vitest |
| Type safety | TypeScript interfaces for props |

---

## Color Palette (from Tailwind Config)

```
Primary:    blue-500, blue-600
Secondary:  gray-500, gray-600
Success:    green-500, green-600
Danger:     red-500, red-600
Warning:    yellow-500, yellow-600
Text:       gray-900 (dark), gray-500 (light)
Background: white, gray-50, gray-100
```

All colors tested for WCAG AA contrast compliance.
