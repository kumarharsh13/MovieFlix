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

  if (loading) return <p className={styles.loadingState}>Loading movie details...</p>;

  if (error) return (
    <div className={styles.errorContainer}>
      <p className={styles.error}>{error}</p>
      <button onClick={fetchDetails} className={styles.retryButton}>Try Again</button>
    </div>
  );

  if (!movie) return <p className={styles.loadingState}>No movie found.</p>;

  const details = [
    { label: 'Genre', value: movie.genre?.length ? movie.genre.join(', ') : null },
    { label: 'Director', value: movie.director },
    { label: 'Actors', value: movie.actors?.length ? movie.actors.join(', ') : null },
    { label: 'Runtime', value: movie.runtime ? `${movie.runtime} min` : null },
    { label: 'Plot', value: movie.plot, isPlot: true },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{movie.title || 'Untitled'}</h1>
      <p className={styles.year}>{movie.year || 'N/A'}</p>

      <div className={styles.content}>
        <div className={styles.posterWrap}>
          <img
            src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
            alt={movie.title || 'Movie Poster'}
            className={styles.poster}
          />
        </div>

        <div className={styles.details}>
          {movie.rating != null && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Rating</span>
              <span className={`${styles.detailValue} ${styles.ratingValue}`}>
                <span className={styles.star}>&#9733;</span> {movie.rating} / 10
              </span>
            </div>
          )}

          {details.map(({ label, value, isPlot }) =>
            value ? (
              <div className={styles.detailRow} key={label}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={`${styles.detailValue} ${isPlot ? styles.plot : ''}`}>
                  {value}
                </span>
              </div>
            ) : null
          )}

          {movie.imdbLink && (
            <a
              href={movie.imdbLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.imdbLink}
            >
              View on IMDb &rarr;
            </a>
          )}
        </div>
      </div>

      <Link to="/" className={styles.backLink}>
        <span className={styles.arrow}>&larr;</span> Back to search
      </Link>
    </div>
  );
};

export default MovieDetails;
