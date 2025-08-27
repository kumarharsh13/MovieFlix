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
      <input
        type="text"
        placeholder="Search for a movie..."
        value={searchTerm || ''}
        onChange={handleChange}
        aria-label="Search movies"
      />
    </div>
  );
};

export default SearchBar;
