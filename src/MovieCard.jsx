import { Link } from "react-router-dom";
import { getPosterUrl, createSvgPoster, getMovieRating } from "./posterHelper";

function MovieCard({
  movieId,
  title,
  rating,
  genre,
  poster,
  onAdd,
  actionText,
  isAdded = false,
}) {
  const displayPoster = poster || getPosterUrl(movieId, title, genre);
  const displayGenre = (genre || "Movie").split("|")[0];
  const formattedRating =
    rating != null && rating !== ""
      ? typeof rating === "number"
        ? rating.toFixed(1)
        : String(rating)
      : getMovieRating(movieId, title);

  return (
    <div className="movie-card">
      <Link to={`/movie/${encodeURIComponent(title || movieId)}`}>
        <img
          className="movie-poster"
          src={displayPoster}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = createSvgPoster(title, genre);
          }}
        />
      </Link>

      <h3 title={title}>{title}</h3>

      <p>⭐ {formattedRating}</p>

      <span>{displayGenre}</span>

      {onAdd && (
        <button
          className={`movie-action-btn ${isAdded ? "active" : ""}`}
          onClick={() =>
            onAdd({
              movieId,
              title,
              rating: formattedRating,
              genre: displayGenre,
              poster: displayPoster,
            })
          }
        >
          {actionText || (isAdded ? "✓ Added" : "＋ Add")}
        </button>
      )}
    </div>
  );
}

export default MovieCard;