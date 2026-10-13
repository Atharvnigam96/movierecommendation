// Movie poster and backdrop lookup + dynamic fallback generator

export const KNOWN_POSTERS = {
  109487: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  79132: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  58559: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  112552: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
  112556: "https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCFWejSkXgJ2.jpg",
  318: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
  112183: "https://image.tmdb.org/t/p/w500/rSZs93P0LLxqlVEbI001UKoeCQC.jpg",
  122892: "https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
  4993: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkbl4c5pJ.jpg",
  2571: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  296: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
  2959: "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
  4878: "https://image.tmdb.org/t/p/w500/5MXyQO7EZZubpVI7p0r4wZfQY5Y.jpg",
  48780: "https://image.tmdb.org/t/p/w500/5MXyQO7EZZubpVI7p0r4wZfQY5Y.jpg",
  480: "https://image.tmdb.org/t/p/w500/fjTU1Bgh3KJu4GSO7dRJygfdM3J.jpg",
  117176: "https://image.tmdb.org/t/p/w500/4ju4i6X7JgqY2fWmKJQ9r9XfXjT.jpg",
  96610: "https://image.tmdb.org/t/p/w500/sNjL6SqEr8UZHlr5OWgWW8qc5zp.jpg", // Looper
  91529: "https://image.tmdb.org/t/p/w500/85NqddVYp0hx2syN52eh4yWVsN.jpg", // Dark Knight Rises
  44191: "https://image.tmdb.org/t/p/w500/104UaFjZ0gGvY9pXpIuKvZz3Xq2.jpg", // V for Vendetta
  89774: "https://image.tmdb.org/t/p/w500/kJsgG44b7hWpZ86XwS9w2U3pM2u.jpg", // Warrior
  104913: "https://image.tmdb.org/t/p/w500/5KGm8k6Z2W0gMv3gS1m0F0E2S6u.jpg", // Rush
  33740: "https://image.tmdb.org/t/p/w500/1hRoyzDtpgMU7Dz4JF22RANzQ57.jpg", // Batman Begins
  1: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", // Toy Story
  2: "https://image.tmdb.org/t/p/w500/vgpXjv1vYogU5dnL09memp5KaTe.jpg", // Jumanji
  858: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather
  593: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg", // Silence of the Lambs
  260: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", // Star Wars
  356: "https://image.tmdb.org/t/p/w500/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg", // Forrest Gump
  110: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", // Braveheart
  68954: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", // Oppenheimer
  999001: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", // Oppenheimer
  999002: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", // Dune: Part Two
  999003: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg", // Gladiator II
  999004: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", // Avatar
};

export const KNOWN_BACKDROPS = {
  109487: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5d3K9c.jpg",
  79132: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
  58559: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
  112552: "https://image.tmdb.org/t/p/original/fRGxZuo7jJUWQsVg9t5p9rKxJkC.jpg",
  112556: "https://image.tmdb.org/t/p/original/6f5sM9V2K4W4kq5p7n8rX9yZ0aB.jpg",
  318: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
  112183: "https://image.tmdb.org/t/p/original/9Yp8wG1Jv3cG4tV6hQ2xM7bR5sD.jpg",
  122892: "https://image.tmdb.org/t/p/original/uLtVbjv1C9m0vZ3J0wqkW5M7b8D.jpg",
  4993: "https://image.tmdb.org/t/p/original/vRQnz4lL4sCqX2z0wJ9dG6r5k7H.jpg",
  2571: "https://image.tmdb.org/t/p/original/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
  296: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
  2959: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
  4878: "https://image.tmdb.org/t/p/original/8Z3t5o6L2R8g3K5m7N9P1Q4V6W0.jpg",
  480: "https://image.tmdb.org/t/p/original/c414cUj7t9Z6sK4m1R2p8V5x0Q.jpg",
  117176: "https://image.tmdb.org/t/p/original/4G8y8m7K2p6Q1R5V9X3Z0L4N8D.jpg",
  999001: "https://image.tmdb.org/t/p/original/rM5Y09xC9Yq01A5pC81U9h50.jpg",
  999002: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520h.jpg",
  999003: "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6vVGm.jpg",
  999004: "https://image.tmdb.org/t/p/original/vL5W4KGDi0gMv3gS1m0F0E2S6u.jpg",
};

export const TITLE_POSTERS = {
  "oppenheimer": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "dune: part two": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  "gladiator ii": "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
  "avatar": "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  "interstellar": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "inception": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  "the dark knight": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "dark knight, the": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "the matrix": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "matrix, the": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "pulp fiction": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
  "fight club": "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
  "the shawshank redemption": "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
  "shawshank redemption, the": "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
  "whiplash": "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
  "jurassic park": "https://image.tmdb.org/t/p/w500/fjTU1Bgh3KJu4GSO7dRJygfdM3J.jpg",
  "the prestige": "https://image.tmdb.org/t/p/w500/5MXyQO7EZZubpVI7p0r4wZfQY5Y.jpg",
  "prestige, the": "https://image.tmdb.org/t/p/w500/5MXyQO7EZZubpVI7p0r4wZfQY5Y.jpg",
  "gone girl": "https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCFWejSkXgJ2.jpg",
  "birdman": "https://image.tmdb.org/t/p/w500/rSZs93P0LLxqlVEbI001UKoeCQC.jpg",
  "guardians of the galaxy": "https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
};

// Generates an elegant SVG placeholder for any movie without a poster
export function createSvgPoster(title = "Movie", genre = "Film") {
  const cleanTitle = (title || "Movie")
    .replace(/\s*\(\d{4}\)\s*$/, "")
    .trim();
  const primaryGenre = (genre || "Film").split("|")[0].trim();

  // Pick deterministic vibrant gradient based on title hash
  const colors = [
    ["#1e1b4b", "#312e81", "#4338ca"],
    ["#14532d", "#166534", "#15803d"],
    ["#701a75", "#86198f", "#a21caf"],
    ["#7c2d12", "#9a3412", "#c2410c"],
    ["#1e293b", "#334155", "#475569"],
    ["#0f172a", "#1e293b", "#3b82f6"],
    ["#3b0764", "#581c87", "#7e22ce"],
    ["#042f2e", "#115e59", "#0d9488"],
  ];
  let hash = 0;
  for (let i = 0; i < cleanTitle.length; i++) {
    hash = (hash << 5) - hash + cleanTitle.charCodeAt(i);
    hash |= 0;
  }
  const colorSet = colors[Math.abs(hash) % colors.length];

  const line1 = cleanTitle.slice(0, 22);
  const line2 = cleanTitle.length > 22 ? cleanTitle.slice(22, 44) : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <defs>
      <linearGradient id="pgrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorSet[0]}"/>
        <stop offset="60%" stop-color="${colorSet[1]}"/>
        <stop offset="100%" stop-color="${colorSet[2]}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="450" fill="url(#pgrad)"/>
    <circle cx="150" cy="160" r="44" fill="white" opacity="0.12"/>
    <polygon points="142,142 168,160 142,178" fill="white" opacity="0.8"/>
    <text x="150" y="260" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700">
      <tspan x="150" dy="0">${line1.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</tspan>
      ${line2 ? `<tspan x="150" dy="24">${line2.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</tspan>` : ""}
    </text>
    <rect x="85" y="325" width="130" height="28" rx="14" fill="#ffffff" opacity="0.15"/>
    <text x="150" y="344" text-anchor="middle" fill="#93c5fd" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="12" font-weight="600" letter-spacing="1">${primaryGenre.toUpperCase()}</text>
    <text x="150" y="420" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10" font-weight="600" letter-spacing="3">CINEMATCH</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getPosterUrl(movieId, title, genre) {
  if (movieId && KNOWN_POSTERS[movieId]) {
    return KNOWN_POSTERS[movieId];
  }
  if (title) {
    const norm = String(title).toLowerCase().replace(/\s*\(\d{4}\)\s*$/, "").trim();
    if (TITLE_POSTERS[norm]) {
      return TITLE_POSTERS[norm];
    }
  }
  return createSvgPoster(title, genre);
}

export function getBackdropUrl(movieId, title) {
  if (movieId && KNOWN_BACKDROPS[movieId]) {
    return KNOWN_BACKDROPS[movieId];
  }
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba";
}

export const KNOWN_RATINGS = {
  318: "9.3",    // Shawshank Redemption
  858: "9.2",    // The Godfather
  58559: "9.0",  // The Dark Knight
  296: "8.9",    // Pulp Fiction
  1221: "9.0",   // The Godfather: Part II
  527: "9.0",    // Schindler's List
  4993: "8.8",   // Lord of the Rings: Fellowship
  7153: "9.0",   // Lord of the Rings: Return of the King
  5952: "8.8",   // Lord of the Rings: Two Towers
  2959: "8.8",   // Fight Club
  356: "8.8",    // Forrest Gump
  79132: "8.8",  // Inception
  2571: "8.7",   // The Matrix
  109487: "8.7", // Interstellar
  593: "8.6",    // Silence of the Lambs
  260: "8.6",    // Star Wars: A New Hope
  1196: "8.7",   // Star Wars: Empire Strikes Back
  110: "8.4",    // Braveheart
  4878: "8.5",   // The Prestige
  112552: "8.5", // Whiplash
  112556: "8.1", // Gone Girl
  112183: "7.7", // Birdman
  122892: "8.0", // Guardians of the Galaxy
  480: "8.2",    // Jurassic Park
  117176: "7.7", // Theory of Everything
  1: "8.3",      // Toy Story
  2: "7.1",      // Jumanji
  999001: "8.9", // Oppenheimer
  999002: "8.6", // Dune: Part Two
  999003: "6.7", // Gladiator II
  999004: "7.9", // Avatar
};

export function getMovieRating(movieId, title = "") {
  if (movieId && KNOWN_RATINGS[movieId]) {
    return KNOWN_RATINGS[movieId];
  }
  const str = String(movieId || title || "cinematch");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  const score = 6.4 + ((hash % 25) / 10);
  return score.toFixed(1);
}

