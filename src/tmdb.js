/**
 * tmdb.js — Frontend TMDB service
 *
 * All requests route through the backend proxy at /api/tmdb/*
 * so the Bearer token never leaves the server.
 *
 * Every function returns null on failure and logs a warning,
 * so callers can gracefully fall back to local data.
 */

const cache = new Map();

async function get(url) {
  if (cache.has(url)) return cache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(url, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch full TMDB movie details by TMDB movie ID.
 * Returns: { tmdbId, title, overview, year, rating, genres, poster, backdrop, trailer, cast, tagline, runtime }
 */
export async function getTmdbMovieById(tmdbId) {
  if (!tmdbId) return null;
  return get(`/api/tmdb/movie/${tmdbId}`);
}

/**
 * Search TMDB by movie title (stripped of year).
 * Returns the best-match object or null.
 * Shape: { tmdbId, title, year, poster, backdrop, rating, overview }
 */
export async function searchTmdb(title) {
  if (!title) return null;
  // Strip trailing year "(YYYY)" before searching
  const clean = String(title).replace(/\s*\(\d{4}\)\s*$/, "").trim();
  const data = await get(`/api/tmdb/search?q=${encodeURIComponent(clean)}`);
  return data?.results?.[0] ?? null;
}

/**
 * Fetch this week's TMDB trending movies.
 * Returns an array of { tmdbId, title, year, poster, backdrop, rating, genres, overview }
 */
export async function getTmdbTrending() {
  const data = await get("/api/tmdb/trending");
  return data?.results ?? [];
}

/**
 * Resolve TMDB poster/backdrop/rating for a MovieLens movieId.
 * The backend does the title-lookup + TMDB search internally.
 * Returns: { tmdbId, poster, backdrop, rating, overview, year } or null
 */
export async function getPosterByMovieLensId(movieId) {
  if (!movieId) return null;
  return get(`/api/tmdb/poster/${movieId}`);
}
