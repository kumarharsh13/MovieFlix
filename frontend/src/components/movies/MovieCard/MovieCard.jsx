import { useRef, useCallback } from 'react';
import styles from './MovieCard.module.css';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const cardRef = useRef(null);
  const shineRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(232,168,56,0.12) 0%, transparent 60%)`;
      shineRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    if (shineRef.current) {
      shineRef.current.style.opacity = '0';
    }
  }, []);

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
    <div
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Shine overlay */}
      <div ref={shineRef} className={styles.shine} />
      {/* Animated border glow */}
      <div className={styles.borderGlow} />

      <div className={styles.posterWrap}>
        {poster ? (
          <img
            src={poster}
            alt={`${title} Poster`}
            className={styles.poster}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/fallback-poster.png';
            }}
          />
        ) : (
          <div className={styles.noPoster}>No Poster</div>
        )}
        {rating != null && (
          <span className={styles.ratingBadge}>
            <span className={styles.star}>&#9733;</span> {rating}
          </span>
        )}
        {/* Shimmer sweep on poster */}
        <div className={styles.shimmer} />
      </div>

      <div className={styles.cardBody}>
        <h3>{title}</h3>
        <span className={styles.yearText}>{year}</span>
        {Array.isArray(genre) && genre.length > 0 && (
          <div className={styles.genreTags}>
            {genre.slice(0, 3).map((g) => (
              <span key={g} className={styles.genreTag}>{g}</span>
            ))}
          </div>
        )}
        <Link to={`/movies/${imdbID || _id}`} className={styles.viewLink}>
          View Details <span className={styles.arrow}>&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
