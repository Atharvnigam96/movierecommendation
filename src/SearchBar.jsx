function SearchBar({ search, setSearch }) {
  return (
    <div className="search-bar">
      <span>🔍</span>

      <input
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;