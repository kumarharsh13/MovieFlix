import styles from './MovieList.module.css';

const MovieList = ({ movies }) => {
  if (!Array.isArray(movies) || movies.length === 0) {
    return <p>No movies found.</p>;
  }

  return (
    <div className={styles.grid}>
      {movies.map((movie) => {
        if (!movie) return null; // skip null or undefined movie entries

        const {
          imdbID,
          title = 'Untitled',
          year = 'Unknown',
          poster,
        } = movie;

        return (
          <div key={imdbID || Math.random()}>
            <h3>
              {title} ({year})
            </h3>
            {poster ? (
              <img
                src={poster}
                alt={`${title} Poster`}
                style={{ width: '200px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fallback-poster.png'; // fallback image path
                }}
              />
            ) : (
              <p>No poster available</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MovieList;
