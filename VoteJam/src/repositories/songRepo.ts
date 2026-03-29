import { Song } from '../types/Song';
import { randomUUID } from 'crypto';

class SongRepository {
  private songs: Map<string, Song> = new Map();
  private userVotes: Map<string, Set<string>> = new Map(); // Map<songId, Set<userId>>

  hasUserVoted(songId: string, userId: string): boolean {
    const votes = this.userVotes.get(songId);
    return votes ? votes.has(userId) : false;
  }

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

  updateVotes(id: string, userId: string, direction: 'up' | 'down'): Song | undefined {
    if (this.hasUserVoted(id, userId)) {
      return undefined;
    }

    const song = this.songs.get(id);
    if (!song) return undefined;

    if (direction === 'up') {
      song.votes += 1;
    } else if (direction === 'down') {
      song.votes = Math.max(0, song.votes - 1);
    }

    let votes = this.userVotes.get(id);
    if (!votes) {
      votes = new Set<string>();
      this.userVotes.set(id, votes);
    }
    votes.add(userId);

    return song;
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
