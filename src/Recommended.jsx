import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import { getPosterByMovieLensId } from "./tmdb";

function Recommended({ search = "", myList = [], onAddToList }) {
  const [movies, setMovies] = useState([]);
  const [recType, setRecType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("cinematch_token");

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          // If not logged in, fetch trending starter movies
          const res = await fetch("/api/trending");
          if (!res.ok) throw new Error("Could not load starter movies");
          const data = await res.json();
          setMovies(data || []);
          setRecType("guest");
          setMessage("Login and rate movies to unlock personalized AI recommendations!");
          return;
        }

        const response = await fetch(
          "/api/recommendations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("cinematch_token");
            localStorage.removeItem("cinematch_user");
            const fallbackRes = await fetch("/api/trending");
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setMovies(fallbackData || []);
              setRecType("guest");
              setMessage("Rate a few movies below to train your personalized AI recommendations!");
              return;
            }
          }
          throw new Error(data.error || "Failed to load recommendations");
        }

        setRecType(data.type || "personalized");
        setMessage(data.message || "");
        setMovies(data.recommendations || []);
      } catch (err) {
        console.error("Recommendation error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [token]);

  const filteredMovies = movies.filter((movie) =>
    movie.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Enrich movie posters from TMDB in the background after recommendations load
  useEffect(() => {
    if (movies.length === 0) return;
    let cancelled = false;

    async function enrichPosters() {
      const enriched = [...movies];
      let changed = false;

      await Promise.all(
        enriched.map(async (movie, i) => {
          // Only fetch if we don't already have a poster
          if (movie.poster) return;
          if (!movie.movieId || movie.movieId > 900000) return; // skip fake/featured ids
          try {
            const tmdb = await getPosterByMovieLensId(movie.movieId);
            if (tmdb?.poster && !cancelled) {
              enriched[i] = {
                ...enriched[i],
                poster: tmdb.poster,
                rating: tmdb.rating || enriched[i].rating,
              };
              changed = true;
            }
          } catch {
            // ignore individual failures
          }
        })
      );

      if (changed && !cancelled) {
        setMovies([...enriched]);
      }
    }

    enrichPosters();
    return () => { cancelled = true; };
  }, [movies.length]); // run once per recommendation batch, not on every render


  return (
    <section className="recommended">
      <div className="section-header">
        <div>
          <h2>
            {recType === "cold_start"
              ? "🎯 Starter Recommendations"
              : recType === "guest"
              ? "🔥 Popular Movies"
              : "✨ Recommended For You"}
          </h2>
          {message && (
            <p style={{ color: "#93c5fd", margin: "6px 0 0", fontSize: "14px" }}>
              {message}
              {!token && (
                <Link
                  to="/auth"
                  style={{
                    marginLeft: "8px",
                    color: "#fff",
                    textDecoration: "underline",
                    fontWeight: "bold",
                  }}
                >
                  Login here →
                </Link>
              )}
            </p>
          )}
        </div>

        <span
          style={{
            color: "#777f8f",
            fontSize: "14px",
          }}
        >
          {filteredMovies.length} movies
        </span>
      </div>

      {loading && (
        <p style={{ color: "white" }}>Finding movies for you...</p>
      )}

      {error && (
        <p style={{ color: "#ff6b6b" }}>{error}</p>
      )}

      {!loading && !error && filteredMovies.length === 0 && (
        <p style={{ color: "#aeb4c0" }}>
          No recommendations match your search.
        </p>
      )}

      {!loading && !error && filteredMovies.length > 0 && (
        <div className="recommendation-grid">
          {filteredMovies.map((movie) => {
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
                rating={
                  movie.similarity != null
                    ? (movie.similarity * 10).toFixed(1)
                    : "8.5"
                }
                genre={movie.genres?.split("|")[0] || "Movie"}
                poster={movie.poster || ""}
                isAdded={isAdded}
                onAdd={onAddToList}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Recommended;