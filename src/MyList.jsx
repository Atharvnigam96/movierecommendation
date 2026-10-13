import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

function MyList({ myList = [], setMyList, onRemoveFromList }) {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("cinematch_token");

  useEffect(() => {
    if (!token) return;

    async function fetchList() {
      setLoading(true);
      try {
        const res = await fetch("/api/my-list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not fetch your list");
        const data = await res.json();
        if (Array.isArray(data)) {
          setMyList(data);
        }
      } catch (err) {
        console.warn("MyList fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, [token, setMyList]);

  const handleRemove = (movie) => {
    if (onRemoveFromList) {
      onRemoveFromList(movie);
    } else {
      setMyList((prev) =>
        prev.filter(
          (m) =>
            m.movieId !== movie.movieId &&
            m.title?.toLowerCase() !== movie.title?.toLowerCase()
        )
      );
    }
  };

  if (!token) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "60px" }}>
        <h1>My List</h1>
        <p style={{ color: "#aeb4c0", margin: "16px 0 24px", fontSize: "16px" }}>
          Please sign in to view and manage your saved movies.
        </p>
        <Link
          to="/auth"
          className="watch-btn"
          style={{ display: "inline-block", padding: "12px 28px" }}
        >
          Login / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: "25px" }}>
        <h1>My Watchlist</h1>
        <p style={{ color: "#8da7d6", margin: "6px 0 0", fontSize: "14px" }}>
          {myList.length} {myList.length === 1 ? "movie" : "movies"} saved
        </p>
      </div>

      {loading && <p style={{ color: "#93c5fd" }}>Loading your saved movies...</p>}

      {!loading && myList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#aeb4c0" }}>
          <h2>Your list is empty</h2>
          <p style={{ margin: "12px 0 24px" }}>
            Add movies from Home or Browse to build your personal watchlist.
          </p>
          <Link
            to="/movies"
            className="watch-btn"
            style={{ display: "inline-block", padding: "12px 24px" }}
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="movie-list">
          {myList.map((movie) => (
            <MovieCard
              key={movie.movieId || movie.title}
              movieId={movie.movieId}
              title={movie.title}
              rating={movie.rating || "8.5"}
              genre={movie.genres || movie.genre || "Drama"}
              poster={movie.poster || ""}
              onAdd={handleRemove}
              actionText="× Remove"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyList;