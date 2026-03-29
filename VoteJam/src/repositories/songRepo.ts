import { Song } from '../types/Song';
import { VoteResponseData } from '../types/Vote';
import { randomUUID } from 'crypto';

export type VoteResult = VoteResponseData;

class SongRepository {
  private songs: Map<string, Song> = new Map();
  // Key: `${songId}:${userId}` -> current vote direction
  private userVotes: Map<string, 'up' | 'down'> = new Map();

  getAll(): Song[] {
    return Array.from(this.songs.values()).sort((a, b) => b.votes - a.votes);
  }

  search(q: string): Song[] {
    const query = q.toLowerCase();
    return Array.from(this.songs.values())
      .filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query)
      )
      .sort((a, b) => b.votes - a.votes);
  }

  getById(id: string): Song | undefined {
    return this.songs.get(id);
  }

  create(song: Omit<Song, 'id' | 'createdAt'>): Song {
    const id = randomUUID();
    const newSong: Song = {
      ...song,
      id,
      createdAt: new Date(),
    };
    this.songs.set(id, newSong);
    return newSong;
  }

  castVote(songId: string, userId: string, direction: 'up' | 'down'): VoteResult | null {
    const song = this.songs.get(songId);
    if (!song) return null;

    const voteKey = `${songId}:${userId}`;
    const current = this.userVotes.get(voteKey);

    if (current === direction) {
      // Toggle off: reverse the effect and clear the vote
      song.votes += direction === 'up' ? -1 : 1;
      this.userVotes.delete(voteKey);
      return { songId, votes: song.votes, userVote: null };
    } else if (current !== undefined) {
      // Switch direction: net effect is ±2
      song.votes += direction === 'up' ? 2 : -2;
      this.userVotes.set(voteKey, direction);
      return { songId, votes: song.votes, userVote: direction };
    } else {
      // Fresh vote
      song.votes += direction === 'up' ? 1 : -1;
      this.userVotes.set(voteKey, direction);
      return { songId, votes: song.votes, userVote: direction };
    }
  }

  delete(id: string): boolean {
    return this.songs.delete(id);
  }

  reset(): void {
    this.songs.clear();
    this.userVotes.clear();
  }
}

export const songRepo = new SongRepository();

