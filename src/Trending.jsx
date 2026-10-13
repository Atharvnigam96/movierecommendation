import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import { getTmdbTrending } from "./tmdb";

// Static fallback in case TMDB is unreachable
const STATIC_TRENDING = [
  {
    movieId: 999001,
    title: "Oppenheimer",
    rating: "8.6",
    genre: "Drama",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
  {
    movieId: 999002,
    title: "Dune: Part Two",
    rating: "8.6",
    genre: "Sci-Fi",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  },
  {
    movieId: 999003,
    title: "Gladiator II",
    rating: "6.6",
    genre: "Action",
    poster: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
  },
  {
    movieId: 999004,
    title: "Avatar",
    rating: "7.6",
    genre: "Adventure",
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  },
];

function Trending({ myList = [], onAddToList }) {
  const [movies, setMovies] = useState(STATIC_TRENDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const results = await getTmdbTrending();
        if (results && results.length > 0) {
          const shaped = results.slice(0, 8).map((m) => ({
            // Use tmdbId as the movieId for routing — MovieDetails will resolve via TMDB
            movieId: m.tmdbId,
            tmdbId: m.tmdbId,
            title: m.title,
            rating: m.rating || "—",
            genre: "Movie",
            poster: m.poster,
            backdrop: m.backdrop,
          }));
          setMovies(shaped);
        }
      } catch (err) {
        console.warn("TMDB trending fetch failed, using static fallback:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <section className="recommended">
      <div className="section-header">
        <h2>🔥 Trending Now {loading && <span style={{ fontSize: "14px", color: "#666" }}>…</span>}</h2>
        <Link to="/movies" style={{ color: "#8da7d6", fontSize: "14px" }}>
          See All Movies →
        </Link>
      </div>

      <div className="movie-list">
        {movies.map((movie) => {
          const isAdded = myList.some(
            (item) =>
              item.movieId === movie.movieId ||
              item.title?.toLowerCase() === movie.title?.toLowerCase()
          );

          return (
            <MovieCard
              key={movie.tmdbId || movie.movieId}
              movieId={movie.movieId}
              title={movie.title}
              rating={movie.rating}
              genre={movie.genre}
              poster={movie.poster}
              isAdded={isAdded}
              onAdd={onAddToList}
            />
          );
        })}
      </div>
    </section>
  );
}

export default Trending;