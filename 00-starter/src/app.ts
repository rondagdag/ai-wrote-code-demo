import express, { Request, Response, NextFunction } from 'express';
import songsRouter from './routes/songs';
import { AppError } from './utils/errors';
import { ApiResponse } from './types/ApiResponse';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use(songsRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      data: null,
      error: { code: err.code, message: err.message },
    };
    return res.status(err.statusCode).json(response);
  }

  // Generic error
  const response: ApiResponse<null> = {
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  };
  res.status(500).json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
