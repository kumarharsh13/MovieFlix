import express from 'express';
import {
  searchMovies,
  getMovieDetails,
  getMovieStats
} from '../controllers/movieController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', searchMovies);
router.get('/stats', protect, adminOnly, getMovieStats);
router.get('/:id', getMovieDetails);

export default router;
