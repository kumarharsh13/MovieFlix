import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './MovieDetails.module.css';
import { getMovieDetails } from '../../apis/movieApis';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMovieDetails(id);

      if (!response || !response.data) {
        throw new Error('No data received from server.');
      }

      setMovie(response.data);
    } catch (err) {
      // Check for detailed error message
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to load movie details.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  if (error) return (
    <div className={styles.errorContainer}>
      <p className={styles.error}>{error}</p>
      <button onClick={fetchDetails} className={styles.retryButton}>Retry</button>
    </div>
  );

  if (!movie) return <p>No movie found.</p>;

  return (
    <div className={styles.container}>
      <h1>{movie.title || 'Untitled'} ({movie.year || 'N/A'})</h1>
      <div className={styles.content}>
        <img
          src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={movie.title || 'Movie Poster'}
          className={styles.poster}
        />
        <div className={styles.details}>
          <p><strong>Genre:</strong> {movie.genre?.length ? movie.genre.join(', ') : 'N/A'}</p>
          <p><strong>Director:</strong> {movie.director || 'N/A'}</p>
          <p><strong>Actors:</strong> {movie.actors?.length ? movie.actors.join(', ') : 'N/A'}</p>
          <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
          <p><strong>Rating:</strong> {movie.rating ?? 'N/A'}</p>
          <p><strong>Plot:</strong> {movie.plot || 'N/A'}</p>
          {movie.imdbLink && (
            <p>
              <a href={movie.imdbLink} target="_blank" rel="noopener noreferrer">
                View on IMDb
              </a>
            </p>
          )}
        </div>
      </div>
      <Link to="/" className={styles.backLink}>← Back to search</Link>
    </div>
  );
};

export default MovieDetails;
