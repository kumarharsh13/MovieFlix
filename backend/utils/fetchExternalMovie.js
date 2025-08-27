// utils/fetchExternalMovie.js

import axios from 'axios';
import Movie from '../models/Movie.js';
import { normalizeMovieData } from './normalizeMovieData.js';

export const fetchAndCacheMovie = async (imdbID) => {
  if (!imdbID) {
    console.error('❌ fetchAndCacheMovie: imdbID is required');
    return null;
  }

  try {
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}`;
    const result = await axios.get(url);

    if (result.data.Response === 'False') {
      console.warn(`⚠️ OMDb API returned error for ID ${imdbID}: ${result.data.Error}`);
      return null;
    }

    const normalized = normalizeMovieData(result.data);

    if (!normalized) {
      console.warn(`⚠️ Normalization failed for movie data: ${JSON.stringify(result.data)}`);
      return null;
    }

    const movie = await Movie.findOneAndUpdate(
      { imdbID },
      { $set: normalized },
      { new: true, upsert: true }
    );

    return movie;
  } catch (error) {
    console.error(`❌ Error fetching movie (${imdbID}):`, error.message);

    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }

    return null;
  }
};
