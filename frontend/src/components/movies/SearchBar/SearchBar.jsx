import styles from './SearchBar.module.css';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleChange = (e) => {
    try {
      setSearchTerm(e.target.value);
    } catch (error) {
      console.error('Error updating search term:', error);
    }
  };

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>&#9906;</span>
        <input
          type="text"
          placeholder="Search movies, directors, actors..."
          value={searchTerm || ''}
          onChange={handleChange}
          aria-label="Search movies"
        />
      </div>
    </div>
  );
};

export default SearchBar;
