import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateUUID } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';
import { songRepo } from '../repositories/songRepo';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/ApiResponse';
import { Song } from '../types/Song';
import { VoteResponseData } from '../types/Vote';

const router = Router();

const CreateSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  artist: z.string().min(1, 'Artist is required').max(200),
});

const VoteSongSchema = z.object({
  direction: z.enum(['up', 'down'], {
    errorMap: () => ({ message: 'direction must be "up" or "down"' }),
  }),
});

const voteRateLimit = rateLimit('vote', 10, 60 * 1000);

function buildVoteResponse(data: VoteResponseData): ApiResponse<VoteResponseData> {
  return { data, error: null };
}

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
// Middleware order: requireAuth -> voteRateLimit -> validateUUID -> validateBody -> handler
router.post(
  '/api/v1/songs/:songId/vote',
  requireAuth,
  voteRateLimit,
  validateUUID('songId'),
  validateBody(VoteSongSchema),
  (req: Request, res: Response) => {
    const { songId } = req.params;
    const { direction } = req.body;
    const userId = req.user!.id;

    const result = songRepo.castVote(songId, userId, direction);

    if (!result) {
      throw new AppError('Song not found', 404, 'SONG_NOT_FOUND');
    }

    res.status(200).json(buildVoteResponse(result));
  }
);

export default router;

