import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { songRepo } from '../repositories/songRepo';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/ApiResponse';
import { Song } from '../types/Song';

const router = Router();

const CreateSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  artist: z.string().min(1, 'Artist is required').max(200),
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

export default router;
