import { useState, useEffect, useCallback } from "react";
import styles from "./Home.module.css";
import SearchBar from "../../components/movies/SearchBar/SearchBar";
import MovieCard from "../../components/movies/MovieCard/MovieCard";
import { searchMovies } from "../../apis/movieApis";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  // Debounce searchTerm changes to avoid too many requests while typing
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchMovies = useCallback(
    async (search, genres, pageNum) => {
      if (!search || search.trim() === "") {
        setMovies([]);
        setGenres([]);
        setError("");
        setTotalPages(1);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const genreParam = genres.length ? genres.join(",") : undefined;

        const response = await searchMovies({
          search,
          genre: genreParam,
          page: pageNum,
          limit,
        });

        if (
          !response ||
          !response.data ||
          !Array.isArray(response.data.data)
        ) {
          throw new Error("Unexpected API response");
        }

        const fetchedMovies = response.data.data;
        setMovies(fetchedMovies);
        setTotalPages(response.data.totalPages || 1);

        // Extract unique genres from fetched movies
        const allGenres = new Set();
        fetchedMovies.forEach((movie) => {
          if (Array.isArray(movie.genre)) {
            movie.genre.forEach((g) => allGenres.add(g));
          }
        });
        setGenres([...allGenres]);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to fetch movies. Please try again later.");
        setMovies([]);
        setGenres([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // Wrapped with debounce
  const debouncedFetch = useCallback(
    debounce((search, genres, pageNum) => {
      fetchMovies(search, genres, pageNum);
    }, 400),
    [fetchMovies]
  );

  // Fetch movies on searchTerm, selectedGenres, or page change
  useEffect(() => {
    debouncedFetch(searchTerm, selectedGenres, page);
  }, [searchTerm, selectedGenres, page, debouncedFetch]);

  // Reset to page 1 when searchTerm or selectedGenres change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedGenres]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  // Handle page changes safely
  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setPage(pageNum);
  };

  return (
    <div className={styles.container}>
      <h1>Search Movies</h1>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {genres.length > 0 && (
        <div className={styles.genreFilter}>
          <label className={styles.genreFilterLabel}>Filter by Genres:</label>
          <div className={styles.genreButtons}>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`${styles.genreButton} ${
                  selectedGenres.includes(genre)
                    ? styles.genreButtonActive
                    : ""
                }`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.moviesGrid}>
        {!loading && movies.length === 0 && !error && (
          <p>No movies found.</p>
        )}
        {movies.map((movie) => (
          <MovieCard key={movie._id || movie.imdbID} movie={movie} />
        ))}
      </div>

      {movies.length > 0 && (
        <div className={styles.pagination}>
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
            ⬅️ Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
