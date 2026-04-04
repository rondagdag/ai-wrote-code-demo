import { Song } from '../types/Song';
import { randomUUID } from 'crypto';

class SongRepository {
  private songs: Map<string, Song> = new Map();
  private songVoters: Map<string, Set<string>> = new Map();

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

  updateVotes(id: string, direction: 'up' | 'down'): Song | undefined {
    const song = this.songs.get(id);
    if (!song) return undefined;

    if (direction === 'up') {
      song.votes += 1;
    } else if (direction === 'down') {
      song.votes = Math.max(0, song.votes - 1);
    }

    return song;
  }

  hasUserVoted(songId: string, userId: string): boolean {
    const voters = this.songVoters.get(songId);
    if (!voters) return false;
    return voters.has(userId);
  }

  recordVote(songId: string, userId: string): void {
    let voters = this.songVoters.get(songId);
    if (!voters) {
      voters = new Set<string>();
      this.songVoters.set(songId, voters);
    }
    voters.add(userId);
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
