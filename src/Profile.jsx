import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile({ user, onLogout, myList = [] }) {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("cinematch_token");

  useEffect(() => {
    if (!token) return;

    async function fetchRatings() {
      setLoading(true);
      try {
        const res = await fetch("/api/ratings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not fetch ratings");
        const data = await res.json();
        setRatings(data || []);
      } catch (err) {
        console.warn("Could not load user ratings:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRatings();
  }, [token]);

  if (!user && !token) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "60px" }}>
        <h1>Profile</h1>
        <p style={{ color: "#aeb4c0", margin: "16px 0 24px" }}>
          Please sign in to view your profile and movie preferences.
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

  // Calculate top rated genres
  const genreCounts = {};
  ratings.forEach((r) => {
    if (r.genres) {
      r.genres.split("|").forEach((g) => {
        const clean = g.trim();
        if (clean) genreCounts[clean] = (genreCounts[clean] || 0) + 1;
      });
    }
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const initial = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="page" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div
        style={{
          background: "#111722",
          border: "1px solid #202838",
          borderRadius: "16px",
          padding: "36px",
          marginBottom: "35px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: "bold",
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
            }}
          >
            {initial}
          </div>

          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: "28px" }}>
              {user?.name || "Movie Enthusiast"}
            </h1>
            <p style={{ margin: "0 0 8px", color: "#8da7d6", fontSize: "14px" }}>
              {user?.email || "Signed in"}
            </p>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                background: "#1e293b",
                borderRadius: "12px",
                color: "#60a5fa",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              ★ Neural Taste Engine Active
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (onLogout) onLogout();
            else {
              localStorage.removeItem("cinematch_token");
              localStorage.removeItem("cinematch_user");
              navigate("/auth");
            }
          }}
          className="logout-button"
          style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "14px" }}
        >
          Sign Out
        </button>
      </div>

      {/* Stats summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            background: "#111722",
            border: "1px solid #202838",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#60a5fa" }}>
            {ratings.length}
          </div>
          <div style={{ color: "#aeb4c0", fontSize: "14px", marginTop: "4px" }}>
            Movies Rated
          </div>
        </div>

        <div
          style={{
            background: "#111722",
            border: "1px solid #202838",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#34d399" }}>
            {myList.length}
          </div>
          <div style={{ color: "#aeb4c0", fontSize: "14px", marginTop: "4px" }}>
            Saved in My List
          </div>
        </div>

        <div
          style={{
            background: "#111722",
            border: "1px solid #202838",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#fbbf24" }}>
            {ratings.length > 0
              ? (ratings.reduce((acc, r) => acc + Number(r.rating), 0) / ratings.length).toFixed(1)
              : "—"}
          </div>
          <div style={{ color: "#aeb4c0", fontSize: "14px", marginTop: "4px" }}>
            Average Star Rating
          </div>
        </div>
      </div>

      {/* Favorite genres */}
      {sortedGenres.length > 0 && (
        <div style={{ marginBottom: "35px" }}>
          <h2 style={{ fontSize: "22px", marginBottom: "14px" }}>Top Rated Genres</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {sortedGenres.map(([g, count]) => (
              <span
                key={g}
                style={{
                  background: "#1b2230",
                  border: "1px solid #2a3345",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  color: "#e2e8f0",
                }}
              >
                {g} <strong style={{ color: "#60a5fa" }}>({count})</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rated movies history */}
      <div>
        <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>Your Rated Movies</h2>

        {loading && <p style={{ color: "#93c5fd" }}>Loading your rating history...</p>}

        {!loading && ratings.length === 0 ? (
          <div
            style={{
              background: "#111722",
              border: "1px dashed #202838",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              color: "#aeb4c0",
            }}
          >
            <p style={{ margin: "0 0 16px" }}>
              You haven&apos;t rated any movies yet. Rating movies personalizes your CineMatch AI recommendations!
            </p>
            <Link to="/movies" className="watch-btn" style={{ display: "inline-block", padding: "10px 22px" }}>
              Browse & Rate Movies
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {ratings.map((r) => (
              <div
                key={r.movieId}
                style={{
                  background: "#111722",
                  border: "1px solid #202838",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Link
                    to={`/movie/${encodeURIComponent(r.title)}`}
                    style={{ color: "white", fontWeight: "600", fontSize: "15px" }}
                  >
                    {r.title}
                  </Link>
                  <p style={{ margin: "4px 0 0", color: "#777f8f", fontSize: "13px" }}>
                    {r.genres?.split("|")[0] || "Film"}
                  </p>
                </div>
                <div style={{ color: "#f5c542", fontSize: "18px", fontWeight: "bold" }}>
                  {"★".repeat(Math.round(r.rating))}
                  <span style={{ fontSize: "12px", marginLeft: "4px", color: "#cbd5e1" }}>
                    {r.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;