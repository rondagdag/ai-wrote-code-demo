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

    // Create a mock song
    const song = songRepo.create({
      title: 'Test Song',
      artist: 'Test Artist',
      submittedBy: 'user-submitter',
      votes: 0,
    });
    songId = song.id;
  });

  it('should upvote a song successfully', async () => {
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(res.body.data.votes).toBe(1);
    expect(songRepo.getById(songId)?.votes).toBe(1);
  });

  it('should downvote a song successfully', async () => {
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'down' });

    expect(res.status).toBe(200);
    expect(res.body.data.votes).toBe(0); // 0 since it cant go below 0
  });

  it('should prevent a user from voting twice on the same song', async () => {
    await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'down' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already voted');
    expect(songRepo.getById(songId)?.votes).toBe(1);
  });

  it('should allow different users to vote on the same song', async () => {
    await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'up' });

    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken2}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(200);
    expect(songRepo.getById(songId)?.votes).toBe(2);
  });

  it('should apply rate limiting', async () => {
    // Fire 5 requests (the limit is 5)
    for (let i = 0; i < 5; i++) {
        await request(app)
        .post(`/api/v1/songs/${songId}/vote`)
        .set('Authorization', `Bearer token${i}`)
        .send({ direction: 'up' });
    }

    // The 6th request from the same 'ip' (jest/vitest defaults to 127.0.0.1 without mock)
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken2}`)
      .send({ direction: 'up' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .send({ direction: 'up' });

    expect(res.status).toBe(401);
  });

  it('should validate request body direction', async () => {
    const res = await request(app)
      .post(`/api/v1/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ direction: 'left' });

    expect(res.status).toBe(400);
  });
});
