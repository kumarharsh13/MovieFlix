// utils/normalizeMovieData.js

export const normalizeMovieData = (raw) => {
  try {
    if (!raw || typeof raw !== 'object') {
      console.warn('⚠️ normalizeMovieData: Invalid input:', raw);
      return null;
    }

    const imdbID = raw.imdbID || raw.id;
    const title = raw.Title || raw.title || 'Untitled';
    const year = parseInt(raw.Year || raw.release_date?.split('-')[0]) || null;

    const genre =
      typeof raw.Genre === 'string'
        ? raw.Genre.split(',').map((g) => g.trim())
        : Array.isArray(raw.genres)
        ? raw.genres.map((g) => g.name)
        : [];

    const director = raw.Director || raw.director || '';

    const actors =
      typeof raw.Actors === 'string'
        ? raw.Actors.split(',').map((a) => a.trim())
        : [];

    const rating = parseFloat(raw.imdbRating || raw.vote_average) || null;

    const runtime =
      raw.Runtime && typeof raw.Runtime === 'string'
        ? parseInt(raw.Runtime.split(' ')[0])
        : raw.runtime || null;

    const plot = raw.Plot || raw.overview || '';
    const poster = raw.Poster && raw.Poster !== 'N/A' ? raw.Poster : '';

    if (!imdbID || !title) {
      console.warn('⚠️ normalizeMovieData: Missing essential fields:', {
        imdbID,
        title,
        raw,
      });
    }

    return {
      imdbID,
      title,
      year,
      genre,
      director,
      actors,
      rating,
      runtime,
      plot,
      poster,
      lastFetched: new Date(),
    };
  } catch (err) {
    console.error('❌ Error normalizing movie data:', err.message);
    return null;
  }
};
