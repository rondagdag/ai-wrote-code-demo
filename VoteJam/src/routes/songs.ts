import { Router, Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { songRepo } from '../repositories/songRepo';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/ApiResponse';
import { Song } from '../types/Song';
import { VoteResponse } from '../types/VoteResponse';

const router = Router();

const CreateSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  artist: z.string().min(1, 'Artist is required').max(200),
});

const VoteSongSchema = z.object({
  direction: z.enum(['up', 'down']),
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip ?? ''),
  handler: (req, res, next) => {
    next(new AppError('Too many vote requests', 429, 'RATE_LIMITED'));
  },
});

// POST /api/v1/songs - Submit a new song
router.post(
  '/api/v1/songs',
  requireAuth,
  validateBody(CreateSongSchema),
  (req: Request, res: Response) => {
    const { title, artist } = req.body;
    const submittedBy = req.user!.id;

    const song = songRepo.create({
      title,
      artist,
      submittedBy,
      votes: 0,
    });

    const response: ApiResponse<Song> = {
      data: song,
      error: null,
    };

    res.status(201).json(response);
  }
);

// GET /api/v1/songs - List all songs
router.get('/api/v1/songs', (req: Request, res: Response) => {
  const songs = songRepo.getAll();

  const response: ApiResponse<Song[]> = {
    data: songs,
    error: null,
  };

  res.status(200).json(response);
});

// POST /api/v1/songs/:songId/vote - Vote on a song
router.post(
  '/api/v1/songs/:songId/vote',
  requireAuth,
  voteLimiter,
  validateBody(VoteSongSchema),
  (req: Request, res: Response) => {
    const { songId } = req.params;
    const { direction } = req.body;
    const userId = req.user!.id;

    const uuidParse = z.string().uuid().safeParse(songId);
    if (!uuidParse.success) {
      throw new AppError('Invalid song ID format', 400, 'VALIDATION_ERROR');
    }

    const result = songRepo.vote(songId, userId, direction);
    if (!result) {
      throw new AppError('Song not found', 404, 'NOT_FOUND');
    }

    const response: ApiResponse<VoteResponse> = {
      data: result,
      error: null,
    };

    res.status(200).json(response);
  }
);

export default router;
