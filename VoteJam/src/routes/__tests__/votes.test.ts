import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { songRepo } from '../../repositories/songRepo';

const createSong = async (title: string, artist: string): Promise<string> => {
  const res = await request(app)
    .post('/api/v1/songs')
    .set('Authorization', 'Bearer creator-token')
    .send({ title, artist });

  return res.body.data.id as string;
};

describe('POST /api/v1/songs/:songId/vote', () => {
  beforeEach(() => {
    songRepo.reset();
  });

  it('returns 200 when vote is cast successfully', async () => {
    const songId = await createSong('Song 1', 'Artist 1');

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', 'Bearer voter-token')
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(songId);
    expect(res.body.data.votes).toBe(1);
    expect(res.body.error).toBeNull();
  });

  it('returns 401 when no token is provided', async () => {
    const songId = await createSong('Song 1', 'Artist 1');

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .send({ direction: 'up' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when direction is invalid', async () => {
    const songId = await createSong('Song 1', 'Artist 1');

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', 'Bearer validator-token')
      .send({ direction: 'sideways' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 when user has already voted on this song', async () => {
    const songId = await createSong('Song 1', 'Artist 1');

    await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', 'Bearer duplicate-token')
      .send({ direction: 'up' });

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', 'Bearer duplicate-token')
      .send({ direction: 'down' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 404 when song does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/songs/non-existent-song/vote')
      .set('Authorization', 'Bearer missing-song-token')
      .send({ direction: 'up' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 429 when vote rate limit is exceeded', async () => {
    const voterToken = 'Bearer rate-limit-token';

    const songIds = await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        createSong(`Rate Song ${index}`, `Rate Artist ${index}`)
      )
    );

    for (let index = 0; index < 5; index += 1) {
      const okRes = await request(app)
        .post(`/api/v1/songs/${songIds[index]}/vote`)
        .set('Authorization', voterToken)
        .send({ direction: 'up' });

      expect(okRes.status).toBe(200);
    }

    const limitedRes = await request(app)
      .post(`/api/v1/songs/${songIds[5]}/vote`)
      .set('Authorization', voterToken)
      .send({ direction: 'up' });

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.error.code).toBe('RATE_LIMITED');
  });
});
