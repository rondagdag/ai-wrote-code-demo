import { Song } from '../types/Song';
import { VoteResponse } from '../types/VoteResponse';
import { randomUUID } from 'crypto';

class SongRepository {
  private songs: Map<string, Song> = new Map();
  private songVoters: Map<string, Map<string, 'up' | 'down'>> = new Map();

  getAll(): Song[] {
    return Array.from(this.songs.values()).sort((a, b) => b.votes - a.votes);
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

  vote(songId: string, userId: string, direction: 'up' | 'down'): VoteResponse | undefined {
    const song = this.songs.get(songId);
    if (!song) return undefined;

    const voters = this.songVoters.get(songId) ?? new Map<string, 'up' | 'down'>();
    const existing = voters.get(userId);

    let userVote: 'up' | 'down' | null;

    if (existing === direction) {
      // Toggle off: same direction → remove vote
      voters.delete(userId);
      song.votes += direction === 'up' ? -1 : 1;
      userVote = null;
    } else if (existing !== undefined) {
      // Change direction
      voters.set(userId, direction);
      song.votes += direction === 'up' ? 2 : -2;
      userVote = direction;
    } else {
      // New vote
      voters.set(userId, direction);
      song.votes += direction === 'up' ? 1 : -1;
      userVote = direction;
    }

    this.songVoters.set(songId, voters);
    return { songId, votes: song.votes, userVote };
  }

  delete(id: string): boolean {
    this.songVoters.delete(id);
    return this.songs.delete(id);
  }

  reset(): void {
    this.songs.clear();
    this.songVoters.clear();
  }
}

export const songRepo = new SongRepository();
