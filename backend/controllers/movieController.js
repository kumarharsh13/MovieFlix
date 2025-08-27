import Movie from '../models/Movie.js';
import axios from 'axios';
import { fetchAndCacheMovie } from '../utils/fetchExternalMovie.js';

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// @route GET /api/movies?search=&genre=&sort=&page=&limit=
export const searchMovies = async (req, res) => {
  const { search, genre, sort, page = 1, limit = 8 } = req.query;

  if (!search || typeof search !== 'string' || search.trim() === '') {
    return res.status(400).json({ error: 'Search query is required and must be a non-empty string.' });
  }

  try {
    let cachedMovies = await Movie.find({
      title: new RegExp(search, 'i'),
      lastFetched: { $gt: new Date(Date.now() - CACHE_EXPIRY_MS) }
    });

    if (!cachedMovies.length) {
      const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(search)}`;
      const result = await axios.get(url);

      if (!result?.data?.Search) {
        return res.status(404).json({ error: 'No movies found for that search term.' });
      }

      const promises = result.data.Search.map((m) => fetchAndCacheMovie(m.imdbID));
      cachedMovies = (await Promise.all(promises)).filter(Boolean);
    }

    let filteredMovies = cachedMovies;

    // Filter by genre
    if (genre) {
      const genreList = genre.split(',').map(g => g.trim().toLowerCase());
      filteredMovies = filteredMovies.filter(m =>
        genreList.every(g => m.genre.map(x => x.toLowerCase()).includes(g))
      );
    }

    // Sorting
    if (sort === 'rating') {
      filteredMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'year') {
      filteredMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    // Pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const startIndex = (pageInt - 1) * limitInt;
    const paginatedMovies = filteredMovies.slice(startIndex, startIndex + limitInt);

    return res.json({
      totalResults: filteredMovies.length,
      currentPage: pageInt,
      totalPages: Math.ceil(filteredMovies.length / limitInt),
      data: paginatedMovies,
    });
  } catch (err) {
    console.error('❌ Error in searchMovies:', err.message);
    return res.status(500).json({ error: 'Failed to fetch movies. Please try again later.' });
  }
};

// @route GET /api/movies/:id
export const getMovieDetails = async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid movie ID.' });
  }

  try {
    let movie = await Movie.findOne({ imdbID: id });

    const isStale = movie && new Date() - movie.lastFetched > CACHE_EXPIRY_MS;

    if (!movie || isStale) {
      movie = await fetchAndCacheMovie(id);
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.json(movie);
  } catch (err) {
    console.error('❌ Error in getMovieDetails:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve movie. Please try again later.' });
  }
};

// Aggregation helper functions
const getGenreDistribution = async () => {
  return Movie.aggregate([
    { $unwind: "$genre" },
    { $group: { _id: "$genre", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

const getAverageRating = async (searchTerm) => {
  const matchStage = searchTerm
    ? { title: { $regex: searchTerm, $options: "i" } }
    : {};

  const result = await Movie.aggregate([
    { $match: matchStage },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);

  return result.length > 0 ? result[0].avgRating : null;
};

const getAverageRuntimeByYear = async () => {
  return Movie.aggregate([
    { $addFields: { yearNum: { $toInt: "$year" } } },
    { $group: { _id: "$yearNum", avgRuntime: { $avg: "$runtime" } } },
    { $sort: { _id: 1 } }
  ]);
};

// @route GET /api/movies/analytics
export const getMovieStats = async (req, res) => {
  try {
    const genreDistribution = await getGenreDistribution();
    const averageRating = await getAverageRating(req.query.search || "");
    const averageRuntimeByYear = await getAverageRuntimeByYear();

    return res.json({
      genreDistribution,
      averageRating: averageRating ? +averageRating.toFixed(2) : null,
      averageRuntimeByYear,
    });
  } catch (err) {
    console.error("❌ Failed to get movie stats:", err.message);
    return res.status(500).json({ error: "Failed to retrieve movie stats." });
  }
};
