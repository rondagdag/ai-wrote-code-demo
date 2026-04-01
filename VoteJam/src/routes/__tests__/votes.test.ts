import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { songRepo } from '../../repositories/songRepo';
import { resetRateLimiter } from '../../middleware/rateLimit';

describe('POST /api/v1/songs/:songId/vote', () => {
  const mockToken = 'testAlphaToken1';
  const mockToken2 = 'differentToken2';
  let songId: string;

  beforeEach(() => {
    songRepo.reset();
    resetRateLimiter();

    const song = songRepo.create({
      title: 'Test Song',
      artist: 'Test Artist',
      submittedBy: 'user-submitter',
      votes: 0,
    });
    songId = song.id;
  });

  // ── US1: Insert / Toggle / Switch ──────────────────────────────────────────

  it('T010: repository NO_VOTE + up -> UP transition', () => {
    const result = songRepo.castVote(songId, 'user-a', 'up');
    expect(result).toMatchObject({ songId, votes: 1, userVote: 'up' });
  });

  it('T010: repository NO_VOTE + down -> DOWN transition', () => {
    const result = songRepo.castVote(songId, 'user-a', 'down');
    expect(result).toMatchObject({ songId, votes: -1, userVote: 'down' });
  });

  it('T010: repository UP + up -> NO_VOTE (toggle off)', () => {
    songRepo.castVote(songId, 'user-a', 'up');
    const result = songRepo.castVote(songId, 'user-a', 'up');
    expect(result).toMatchObject({ songId, votes: 0, userVote: null });
  });

  it('T010: repository DOWN + down -> NO_VOTE (toggle off)', () => {
    songRepo.castVote(songId, 'user-a', 'down');
    const result = songRepo.castVote(songId, 'user-a', 'down');
    expect(result).toMatchObject({ songId, votes: 0, userVote: null });
  });

  it('T010: repository UP + down -> DOWN (switch, net -1)', () => {
    songRepo.castVote(songId, 'user-a', 'up');
    const result = songRepo.castVote(songId, 'user-a', 'down');
    expect(result).toMatchObject({ songId, votes: -1, userVote: 'down' });
  });

  it('T010: repository DOWN + up -> UP (switch, net +1)', () => {
    songRepo.castVote(songId, 'user-a', 'down');
    const result = songRepo.castVote(songId, 'user-a', 'up');
    expect(result).toMatchObject({ songId, votes: 1, userVote: 'up' });
  });

  it('T009: should allow different users to vote independently', async () => {
    await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken2}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.data.votes).toBe(2);
  });

  // ── US2: Validation and Error Handling ─────────────────────────────────────

  it('T016: should return 400 for invalid UUID songId', async () => {
    const res = await request(app)
      .post('/api/v1/songs/not-a-uuid/vote')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('T016: should return 400 for invalid direction value', async () => {
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'sideways' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('T017: should return 401 when no auth token is provided', async () => {
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .send({ direction: 'up' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('T017: should return 404 SONG_NOT_FOUND for unknown song UUID', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post(`/api/v1/songs/${unknownId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('SONG_NOT_FOUND');
  });

  // ── US3: Per-User Rate Limiting ─────────────────────────────────────────────

  it('T022: should rate-limit same user after 10 vote changes per minute', async () => {
    const songs = [];
    for (let i = 0; i < 11; i++) {
      songs.push(
        songRepo.create({ title: `Song ${i}`, artist: 'A', submittedBy: 'x', votes: 0 })
      );
    }

    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post(`/api/v1/songs/${songs[i].id}/vote`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ direction: 'up' });
      expect(res.status).toBe(200);
    }

    const res = await request(app)
      .post(`/api/v1/songs/${songs[10].id}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
  });

  it('T022: different users should have independent rate limit buckets', async () => {
    const songs = [];
    for (let i = 0; i < 11; i++) {
      songs.push(
        songRepo.create({ title: `Song ${i}`, artist: 'A', submittedBy: 'x', votes: 0 })
      );
    }

    for (let i = 0; i < 10; i++) {
      await request(app)
        .post(`/api/v1/songs/${songs[i].id}/vote`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ direction: 'up' });
    }

    const res = await request(app)
      .post(`/api/v1/songs/${songs[10].id}/vote`)
      .set('Authorization', `Bearer ${mockToken2}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
  });

  it('T023: concurrent votes preserve deterministic aggregate total', async () => {
    const votes = await Promise.all([
      request(app)
        .post(`/api/v1/songs/${songId}/vote`)
        .set('Authorization', 'Bearer userA')
        .send({ direction: 'up' }),
      request(app)
        .post(`/api/v1/songs/${songId}/vote`)
        .set('Authorization', 'Bearer userB')
        .send({ direction: 'up' }),
      request(app)
        .post(`/api/v1/songs/${songId}/vote`)
        .set('Authorization', 'Bearer userC')
        .send({ direction: 'down' }),
    ]);

    const statuses = votes.map((r) => r.status);
    expect(statuses.every((s) => s === 200)).toBe(true);

    // Net should be +1 (up + up + down = 1 + 1 - 1 = 1)
    const song = songRepo.getById(songId);
    expect(song?.votes).toBe(1);
  });
});
