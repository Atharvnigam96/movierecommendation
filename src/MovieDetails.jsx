import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPosterUrl, getBackdropUrl, getMovieRating } from "./posterHelper";
import { searchTmdb, getTmdbMovieById } from "./tmdb";

const FEATURED_MOVIES_MAP = {
  109487: {
    movieId: 109487,
    title: "Interstellar",
    rating: "8.7",
    genre: "Sci-Fi",
    year: "2014",
    description: "A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5d3K9c.jpg",
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
  },
  79132: {
    movieId: 79132,
    title: "Inception",
    rating: "8.8",
    genre: "Sci-Fi",
    year: "2010",
    description: "A skilled thief who steals secrets through dreams is given a chance to erase his past by planting an idea in someone's mind.",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
  },
  58559: {
    movieId: 58559,
    title: "The Dark Knight",
    rating: "9.0",
    genre: "Action",
    year: "2008",
    description: "Batman faces a criminal mastermind known as the Joker, who plunges Gotham City into chaos.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  },
  112552: {
    movieId: 112552,
    title: "Whiplash",
    rating: "8.5",
    genre: "Drama",
    year: "2014",
    description: "A young jazz drummer pushes himself to the limit under the demanding guidance of an intimidating instructor.",
    poster: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fRGxZuo7jJUWQsVg9t5p9rKxJkC.jpg",
    trailer: "https://www.youtube.com/watch?v=7d_jQycdQGo",
    cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser"],
  },
  112556: {
    movieId: 112556,
    title: "Gone Girl",
    rating: "8.1",
    genre: "Drama",
    year: "2014",
    description: "A man's wife disappears on their anniversary, turning their seemingly perfect marriage into a media spectacle.",
    poster: "https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCFWejSkXgJ2.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6f5sM9V2K4W4kq5p7n8rX9yZ0aB.jpg",
    trailer: "https://www.youtube.com/watch?v=2-_-1nJf8Vg",
    cast: ["Ben Affleck", "Rosamund Pike", "Neil Patrick Harris"],
  },
  318: {
    movieId: 318,
    title: "The Shawshank Redemption",
    rating: "9.3",
    genre: "Drama",
    year: "1994",
    description: "Two imprisoned men form a friendship that helps them survive years inside prison.",
    poster: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    trailer: "https://www.youtube.com/watch?v=PLl99DlL6b4",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
  },
  2571: {
    movieId: 2571,
    title: "The Matrix",
    rating: "8.7",
    genre: "Action",
    year: "1999",
    description: "A computer hacker discovers that reality is not what it seems.",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    trailer: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
  },
  296: {
    movieId: 296,
    title: "Pulp Fiction",
    rating: "8.9",
    genre: "Drama",
    year: "1994",
    description: "Several interconnected stories unfold around criminals, hitmen, and unexpected encounters in Los Angeles.",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    trailer: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
  },
  2959: {
    movieId: 2959,
    title: "Fight Club",
    rating: "8.8",
    genre: "Drama",
    year: "1999",
    description: "An insomniac office worker becomes involved with a mysterious man who creates an underground fight club.",
    poster: "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    trailer: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
  },
  999001: {
    movieId: 999001,
    title: "Oppenheimer",
    rating: "8.6",
    genre: "Drama",
    year: "2023",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rM5Y09xC9Yq01A5pC81U9h50.jpg",
    trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
  },
  999002: {
    movieId: 999002,
    title: "Dune: Part Two",
    rating: "8.6",
    genre: "Sci-Fi",
    year: "2024",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520h.jpg",
    trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
  },
  999003: {
    movieId: 999003,
    title: "Gladiator II",
    rating: "6.6",
    genre: "Action",
    year: "2024",
    description: "Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors.",
    poster: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6vVGm.jpg",
    trailer: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    cast: ["Paul Mescal", "Pedro Pascal", "Denzel Washington"],
  },
  999004: {
    movieId: 999004,
    title: "Avatar",
    rating: "7.6",
    genre: "Adventure",
    year: "2009",
    description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/vL5W4KGDi0gMv3gS1m0F0E2S6u.jpg",
    trailer: "https://www.youtube.com/watch?v=5PSNL1qE6VY",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
  },
};

function MovieDetails({ myList = [], onAddToList }) {
  const { title } = useParams();
  const rawParam = decodeURIComponent(title || "").trim();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  // 1. Fetch movie info
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    async function loadMovie() {
      // ── Helper: enrich a base movie object with live TMDB data ──────────
      async function enrichWithTmdb(base) {
        try {
          // First try searching by title to get a TMDB id
          const searchTitle = (base.title || "").replace(/\s*\(\d{4}\)\s*$/, "").trim();
          const searchResult = await searchTmdb(searchTitle);
          if (!searchResult) return base;

          // Then fetch full details by TMDB id
          const tmdb = await getTmdbMovieById(searchResult.tmdbId);
          if (!tmdb) return { ...base, poster: searchResult.poster || base.poster, backdrop: searchResult.backdrop || base.backdrop };

          return {
            ...base,
            poster: tmdb.poster || base.poster,
            backdrop: tmdb.backdrop || base.backdrop,
            description: tmdb.overview || base.description,
            rating: tmdb.rating || base.rating,
            year: tmdb.year || base.year,
            genre: tmdb.genres ? tmdb.genres.split("|")[0] : base.genre,
            genres: tmdb.genres || base.genres,
            cast: tmdb.cast?.length ? tmdb.cast : base.cast,
            trailer: tmdb.trailer || base.trailer,
            tagline: tmdb.tagline || "",
            runtime: tmdb.runtime || null,
            tmdbId: tmdb.tmdbId,
          };
        } catch {
          return base;
        }
      }

      // ── 1. Check featured dictionary ─────────────────────────────────────
      const numericId = Number(rawParam);
      if (Number.isFinite(numericId) && FEATURED_MOVIES_MAP[numericId]) {
        const base = FEATURED_MOVIES_MAP[numericId];
        if (!ignore) setMovie(base); // paint immediately
        const enriched = await enrichWithTmdb(base);
        if (!ignore) {
          setMovie(enriched);
          setLoading(false);
        }
        return;
      }

      // ── 2. Check featured by title ────────────────────────────────────────
      const foundFeatured = Object.values(FEATURED_MOVIES_MAP).find(
        (m) => m.title.toLowerCase() === rawParam.toLowerCase()
      );
      if (foundFeatured) {
        if (!ignore) setMovie(foundFeatured); // paint immediately
        const enriched = await enrichWithTmdb(foundFeatured);
        if (!ignore) {
          setMovie(enriched);
          setLoading(false);
        }
        return;
      }

      // ── 3. Fetch from backend SQLite, then enrich with TMDB ───────────────
      try {
        const res = await fetch(`/api/movies/${encodeURIComponent(rawParam)}`);
        if (!res.ok) throw new Error("Movie not found");
        const data = await res.json();

        const yearMatch = data.title.match(/\((\d{4})\)/);
        const year = yearMatch ? yearMatch[1] : "Classic";
        const primaryGenre = (data.genres || "Drama").split("|")[0];

        const base = {
          movieId: data.movieId,
          title: data.title,
          rating: data.rating || getMovieRating(data.movieId, data.title),
          genre: primaryGenre,
          genres: data.genres,
          year,
          description: `A celebrated ${primaryGenre} film featuring compelling storytelling and iconic cinematic sequences.`,
          poster: getPosterUrl(data.movieId, data.title, data.genres),
          backdrop: getBackdropUrl(data.movieId, data.title),
          trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(data.title + " official trailer")}`,
          cast: [],
        };

        if (!ignore) setMovie(base); // paint immediately with local data

        const enriched = await enrichWithTmdb(base);
        if (!ignore) {
          setMovie(enriched);
        }
      } catch (err) {
        console.warn("Movie lookup failed:", err.message);

        // ── 4. If rawParam looks like a large TMDB id, fetch directly ────────
        if (Number.isFinite(numericId) && numericId >= 100000) {
          try {
            const tmdb = await getTmdbMovieById(numericId);
            if (tmdb && !ignore) {
              setMovie({
                movieId: numericId,
                tmdbId: numericId,
                title: tmdb.title,
                rating: tmdb.rating || "—",
                genre: tmdb.genres ? tmdb.genres.split("|")[0] : "Movie",
                genres: tmdb.genres,
                year: tmdb.year,
                description: tmdb.overview,
                poster: tmdb.poster,
                backdrop: tmdb.backdrop,
                trailer: tmdb.trailer,
                cast: tmdb.cast || [],
                tagline: tmdb.tagline || "",
                runtime: tmdb.runtime || null,
              });
              return;
            }
          } catch {
            // fall through to null
          }
        }

        if (!ignore) setMovie(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadMovie();
    return () => {
      ignore = true;
    };
  }, [rawParam]);


  // 2. Load user's existing rating for this movie
  useEffect(() => {
    const token = localStorage.getItem("cinematch_token");
    if (!token || !movie) return;

    async function fetchUserRating() {
      try {
        const res = await fetch("/api/ratings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("cinematch_token");
            localStorage.removeItem("cinematch_user");
          }
          return;
        }
        const ratings = await res.json();
        const existing = ratings.find(
          (r) =>
            r.movieId === movie.movieId ||
            r.title?.toLowerCase() === movie.title?.toLowerCase()
        );
        if (existing) {
          setUserRating(Number(existing.rating));
        }
      } catch (err) {
        console.warn("Could not fetch user rating:", err);
      }
    }

    fetchUserRating();
  }, [movie]);

  const handleRating = async (rating) => {
    const token = localStorage.getItem("cinematch_token");

    if (!token) {
      setRatingMessage("Please login to rate movies.");
      return;
    }

    if (!movie) return;

    setUserRating(rating);
    setRatingMessage("");
    setRatingLoading(true);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: movie.movieId,
          title: movie.title,
          rating,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("cinematch_token");
          localStorage.removeItem("cinematch_user");
          throw new Error("Please log in to rate movies.");
        }
        throw new Error(data.error || "Failed to save rating");
      }

      setRatingMessage("Rating saved ✓ (Recommendations updated!)");
    } catch (error) {
      console.error("Rating error:", error);
      setRatingMessage(error.message);
    } finally {
      setRatingLoading(false);
    }
  };

  const isAdded =
    movie &&
    myList.some(
      (item) =>
        item.movieId === movie.movieId ||
        item.title?.toLowerCase() === movie.title?.toLowerCase()
    );

  const handleToggleList = () => {
    if (!movie) return;
    onAddToList({
      movieId: movie.movieId,
      title: movie.title,
      rating: movie.rating,
      genre: movie.genre,
      poster: movie.poster,
    });
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "80px" }}>
        <h2>Loading movie details...</h2>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "80px" }}>
        <h1>Movie not found</h1>
        <p style={{ color: "#aeb4c0", margin: "16px 0 24px" }}>
          We could not find &quot;{rawParam}&quot; in the database.
        </p>
        <Link to="/movies" className="back-button">
          ← Back to Movies
        </Link>
      </div>
    );
  }

  const backdrop = movie.backdrop || getBackdropUrl(movie.movieId, movie.title);
  const poster = movie.poster || getPosterUrl(movie.movieId, movie.title, movie.genre);

  return (
    <div
      className="movie-details-page"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 8, 15, 0.88), rgba(5, 8, 15, 0.96)), url(${backdrop})`,
      }}
    >
      <div className="movie-details-container">
        <div className="movie-details-poster">
          <img src={poster} alt={movie.title} />
        </div>

        <div className="movie-details-content">
          <p className="movie-label">CINEMATCH FEATURED</p>
          <h1>{movie.title}</h1>

          <div className="movie-meta">
            <span>⭐ {movie.rating || "8.5"}</span>
            <span>{movie.genre}</span>
            <span>{movie.year || "Classic"}</span>
            {movie.runtime && <span>{movie.runtime} min</span>}
          </div>

          {movie.tagline && (
            <p style={{ color: "#93c5fd", fontStyle: "italic", margin: "0 0 12px", fontSize: "15px" }}>
              &ldquo;{movie.tagline}&rdquo;
            </p>
          )}

          <p className="movie-description">{movie.description}</p>

          <h2>Rate this movie</h2>

          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRating(rating)}
                disabled={ratingLoading}
                className={userRating >= rating ? "selected" : ""}
                title={`${rating} Star${rating > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
            {userRating > 0 && (
              <span style={{ marginLeft: "12px", alignSelf: "center", color: "#ffd43b", fontSize: "15px" }}>
                {userRating}.0 / 5.0
              </span>
            )}
          </div>

          {ratingMessage && (
            <p
              className={
                ratingMessage.includes("saved")
                  ? "rating-success"
                  : "rating-error"
              }
            >
              {ratingMessage}
            </p>
          )}

          {movie.cast && movie.cast.length > 0 && (
            <div className="cast-section">
              <h2>Key Cast</h2>
              <div className="cast-list">
                {movie.cast.map((actor) => (
                  <div key={actor} className="cast-card">
                    <div className="cast-avatar">
                      {actor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <h3>{actor}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="movie-actions">
            <button
              type="button"
              className="add-list-button"
              onClick={handleToggleList}
            >
              {isAdded ? "✓ In My List" : "＋ Add to My List"}
            </button>

            <a
              href={movie.trailer}
              target="_blank"
              rel="noreferrer"
              className="trailer-button"
            >
              ▶ Watch Trailer
            </a>
          </div>

          <Link to="/movies" className="back-button">
            ← Back to Movies
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;