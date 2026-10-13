import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import MovieCard from "./MovieCard";
import { getMovieRating } from "./posterHelper";
import { getPosterByMovieLensId } from "./tmdb";

const FEATURED_FALLBACK_MOVIES = [
  { movieId: 109487, title: "Interstellar", rating: "8.7", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { movieId: 79132, title: "Inception", rating: "8.8", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
  { movieId: 58559, title: "The Dark Knight", rating: "9.0", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { movieId: 112552, title: "Whiplash", rating: "8.5", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg" },
  { movieId: 112556, title: "Gone Girl", rating: "8.1", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCFWejSkXgJ2.jpg" },
  { movieId: 318, title: "The Shawshank Redemption", rating: "9.3", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" },
  { movieId: 112183, title: "Birdman", rating: "7.7", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/rSZs93P0LLxqlVEbI001UKoeCQC.jpg" },
  { movieId: 122892, title: "Guardians of the Galaxy", rating: "8.0", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg" },
  { movieId: 4993, title: "The Lord of the Rings: The Fellowship of the Ring", rating: "8.8", genre: "Adventure", poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkbl4c5pJ.jpg" },
  { movieId: 2571, title: "The Matrix", rating: "8.7", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
  { movieId: 296, title: "Pulp Fiction", rating: "8.9", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
  { movieId: 2959, title: "Fight Club", rating: "8.8", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg" },
  { movieId: 4878, title: "The Prestige", rating: "8.5", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/5MXyQO7EZZubpVI7p0r4wZfQY5Y.jpg" },
  { movieId: 480, title: "Jurassic Park", rating: "8.2", genre: "Adventure", poster: "https://image.tmdb.org/t/p/w500/fjTU1Bgh3KJu4GSO7dRJygfdM3J.jpg" },
  { movieId: 117176, title: "The Theory of Everything", rating: "7.7", genre: "Drama", poster: "https://image.tmdb.org/t/p/w500/4ju4i6X7JgqY2fWmKJQ9r9XfXjT.jpg" },
];

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

function Movies({ search, setSearch, myList = [], onAddToList }) {
  const [genre, setGenre] = useState("All");
  const [movies, setMovies] = useState(FEATURED_FALLBACK_MOVIES);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchMovies() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "24",
          genre: genre === "All" ? "" : genre,
          q: search.trim(),
        });

        const res = await fetch(`/api/movies?${queryParams}`);
        if (!res.ok) throw new Error("Could not fetch movies from database");

        const data = await res.json();
        if (!ignore) {
          if (data.movies && data.movies.length > 0) {
            setMovies(data.movies);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.total || 0);
          } else if (search || genre !== "All") {
            setMovies([]);
            setTotalPages(1);
            setTotalCount(0);
          } else {
            setMovies(FEATURED_FALLBACK_MOVIES);
            setTotalPages(1);
            setTotalCount(FEATURED_FALLBACK_MOVIES.length);
          }
        }
      } catch (err) {
        console.warn("Backend movies fetch failed, using fallback:", err.message);
        if (!ignore) {
          const filtered = FEATURED_FALLBACK_MOVIES.filter((m) => {
            const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
            const matchesGenre = genre === "All" || m.genre.includes(genre);
            return matchesSearch && matchesGenre;
          });
          setMovies(filtered);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = setTimeout(fetchMovies, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, genre, page]);

  // Enrich movie posters from TMDB in the background after each page loads
  useEffect(() => {
    if (movies.length === 0) return;
    let cancelled = false;

    async function enrichPosters() {
      // Only enrich movies that are missing posters (SQLite movies have no poster field)
      const needsEnrichment = movies
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => !m.poster && m.movieId < 900000);

      if (needsEnrichment.length === 0) return;

      const enriched = [...movies];
      let changed = false;

      // Enrich in batches of 6 to avoid flooding TMDB
      const batch = needsEnrichment.slice(0, 6);
      await Promise.all(
        batch.map(async ({ m, i }) => {
          try {
            const tmdb = await getPosterByMovieLensId(m.movieId);
            if (tmdb?.poster && !cancelled) {
              enriched[i] = {
                ...enriched[i],
                poster: tmdb.poster,
                rating: tmdb.rating || enriched[i].rating,
              };
              changed = true;
            }
          } catch {
            // silently ignore per-movie failures
          }
        })
      );

      if (changed && !cancelled) {
        setMovies([...enriched]);
      }
    }

    enrichPosters();
    return () => { cancelled = true; };
  }, [movies.length, page]); // re-run per page change

  // Reset to page 1 on filter/search change
  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <h1>Explore Movies</h1>
        {totalCount > 0 && (
          <p style={{ color: "#8da7d6", margin: "4px 0 0", fontSize: "14px" }}>
            Showing {movies.length} of {totalCount} movies in database
          </p>
        )}
      </div>

      <SearchBar search={search} setSearch={handleSearchChange} />

      <div className="genre-filter">
        {GENRES.map((item) => (
          <button
            key={item}
            onClick={() => handleGenreChange(item)}
            className={genre === item ? "active" : ""}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: "#93c5fd", margin: "20px 0" }}>Loading movies from database...</p>
      )}

      {!loading && movies.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#aeb4c0" }}>
          <h3>No movies found</h3>
          <p>Try searching for a different title or select a different genre.</p>
        </div>
      ) : (
        <div className="movie-list">
          {movies.map((movie) => {
            const isAdded = myList.some(
              (item) =>
                item.movieId === movie.movieId ||
                item.title?.toLowerCase() === movie.title?.toLowerCase()
            );

            return (
              <MovieCard
                key={movie.movieId || movie.title}
                movieId={movie.movieId}
                title={movie.title}
                rating={movie.rating || getMovieRating(movie.movieId, movie.title)}
                genre={movie.genres || movie.genre || "Drama"}
                poster={movie.poster || ""}
                isAdded={isAdded}
                onAdd={onAddToList}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "40px",
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="movie-action-btn"
            style={{ width: "auto", padding: "8px 20px" }}
          >
            ← Previous
          </button>
          <span style={{ color: "#c8cfdb", fontSize: "14px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="movie-action-btn"
            style={{ width: "auto", padding: "8px 20px" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Movies;