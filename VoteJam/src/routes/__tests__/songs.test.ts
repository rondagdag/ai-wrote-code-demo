import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { songRepo } from '../../repositories/songRepo';

describe('Songs Routes', () => {
  beforeEach(() => {
    songRepo.reset();
  });

  afterEach(() => {
    songRepo.reset();
  });

  describe('POST /api/v1/songs', () => {
    it('should create a song with valid data and auth token', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer test-token-123')
        .send({
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Bohemian Rhapsody');
      expect(response.body.data.artist).toBe('Queen');
      expect(response.body.data.votes).toBe(0);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.error).toBeNull();
    });

    it('should reject request without authorization header', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .send({
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with invalid authorization header', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'InvalidHeader')
        .send({
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with missing title', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer test-token-123')
        .send({
          artist: 'Queen',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with missing artist', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer test-token-123')
        .send({
          title: 'Bohemian Rhapsody',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with empty title', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer test-token-123')
        .send({
          title: '',
          artist: 'Queen',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with title exceeding max length', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer test-token-123')
        .send({
          title: 'a'.repeat(201),
          artist: 'Queen',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should include submittedBy field with user id from token', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer abc12345xyz')
        .send({
          title: 'Song Title',
          artist: 'Song Artist',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.submittedBy).toBeDefined();
      expect(response.body.data.submittedBy).toBe('user-abc12345');
    });

    it('should reject request with artist exceeding max length', async () => {
      const response = await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer test-token-123')
        .send({
          title: 'Song Title',
          artist: 'a'.repeat(201),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/songs', () => {
    it('should return empty list when no songs exist', async () => {
      const response = await request(app).get('/api/v1/songs');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.error).toBeNull();
    });

    it('should return all songs sorted by votes descending', async () => {
      // Create songs with different vote counts
      await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer token1')
        .send({ title: 'Song A', artist: 'Artist A' });

      await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer token2')
        .send({ title: 'Song B', artist: 'Artist B' });

      await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer token3')
        .send({ title: 'Song C', artist: 'Artist C' });

      // Manually update votes to test sorting
      const songs = songRepo.getAll();
      songRepo.updateVotes(songs[0].id, 'user1', 'up');
      songRepo.updateVotes(songs[0].id, 'user2', 'up');
      songRepo.updateVotes(songs[1].id, 'user1', 'up');

      const response = await request(app).get('/api/v1/songs');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].votes).toBe(2);
      expect(response.body.data[1].votes).toBe(1);
      expect(response.body.data[2].votes).toBe(0);
    });

    it('should not require authentication', async () => {
      await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer token1')
        .send({ title: 'Song A', artist: 'Artist A' });

      const response = await request(app).get('/api/v1/songs');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should include all song fields in response', async () => {
      const response = await request(app).get('/api/v1/songs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBeNull();
    });

    it('should return songs with correct structure', async () => {
      await request(app)
        .post('/api/v1/songs')
        .set('Authorization', 'Bearer token1')
        .send({ title: 'Song A', artist: 'Artist A' });

      const response = await request(app).get('/api/v1/songs');

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('artist');
      expect(response.body.data[0]).toHaveProperty('submittedBy');
      expect(response.body.data[0]).toHaveProperty('votes');
      expect(response.body.data[0]).toHaveProperty('createdAt');
    });
  });
});
