import styles from './MovieCard.module.css';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  if (!movie) {
    return <div className={styles.card}>No movie data available.</div>;
  }

  const {
    poster,
    title = 'Untitled',
    year = 'Unknown',
    rating,
    genre,
    imdbID,
    _id,
  } = movie;

  return (
    <div className={styles.card}>
      {poster ? (
        <img
          src={poster}
          alt={`${title} Poster`}
          className={styles.poster}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/fallback-poster.png'; // fallback image path
          }}
        />
      ) : (
        <div className={styles.noPoster}>No Poster</div>
      )}
      <h3>{title}</h3>
      <p><strong>Year:</strong> {year}</p>
      <p><strong>Rating:</strong> {rating != null ? rating : 'N/A'}</p>
      <p><strong>Genre:</strong> {Array.isArray(genre) ? genre.join(', ') : 'N/A'}</p>
      <Link to={`/movies/${imdbID || _id}`}>View Details</Link>
    </div>
  );
};

export default MovieCard;
