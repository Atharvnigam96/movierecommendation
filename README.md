<<<<<<< HEAD
# 🎬 CineMatch – Personalized AI Movie Recommendation System

CineMatch is a full-stack personalized movie recommendation platform powered by a neural collaborative filtering model trained on **MovieLens 20M** (27,000+ movies, 20M ratings).

---

## 🏗️ Architecture

```text
React (Vite :5173) ──proxy──▶ Express REST API (:5000) ──▶ SQLite (cinematch.db)
                                     │
                                     ▼ (HTTP / JSON)
                           Python ML Service (:8000)
                                     │
                                     ▼
                          PyTorch Model (CUDA / GPU)
                           (cinematch_model.pth)
```

1. **Frontend (Vite + React 19 + React Router v7)**
   - Dynamic movie browsing with 12 genre filters and real-time title search
   - Database pagination across 27,278 movies
   - Interactive 5-star rating system with instant ML recommendation updates
   - Personal Watchlist ("My List") synced to SQLite
   - User Profile with rating history, favorite genres, and stats
   - Responsive dark cinema UI with automatic SVG poster generation and TMDB fallbacks

2. **Backend (Node.js + Express + SQLite / better-sqlite3)**
   - JWT authentication (`/api/auth/register`, `/api/auth/login`)
   - Paginated movie catalog (`/api/movies?q=...&genre=...&page=...`)
   - Movie lookup by ID or title slug (`/api/movies/:id`)
   - Ratings storage and history (`/api/ratings`)
   - Watchlist management (`/api/my-list`)
   - Cold-start and ML recommendation gateway with 6-second timeout resilience (`/api/recommendations`)

3. **Machine Learning Engine (Python + PyTorch + CUDA)**
   - Pre-trained embedding-based collaborative filtering model on 20M ratings
   - Fast cosine-similarity vector aggregation for new users based on rated items
   - Loaded as an in-memory daemon service responding in under 30ms

---

## 🚀 Quick Start (Windows)

### Option 1: One-Click Launcher
Double-click `start.bat` in the project root. It will:
1. Launch the Python ML service on port `8000`
2. Launch the Express backend on port `5000`
3. Launch the Vite dev server on port `5173`
4. Automatically open `http://localhost:5173` in your browser

---

### Option 2: Manual Terminal Launch

**Terminal 1 – Python ML Service:**
```bash
cd ML
python ml_service.py
```
*(Loads `cinematch_model.pth` onto GPU/CPU in ~2 seconds and listens on port 8000)*

**Terminal 2 – Backend Server:**
```bash
cd backend
node src/server.js
```
*(Listens on port 5000 and connects to `cinematch.db`)*

**Terminal 3 – Frontend:**
```bash
npm run dev
```
*(Runs Vite at `http://localhost:5173`)*

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/movies` | Paginated movie catalog with genre & query search | No |
| `GET` | `/api/movies/:id` | Get movie details by ID or title | No |
| `GET` | `/api/trending` | Top 8 featured / trending movies | No |
| `GET` | `/api/recommendations` | Get personalized ML recommendations | Yes (Bearer token) |
| `POST` | `/api/ratings` | Rate a movie (1-5 stars) | Yes (Bearer token) |
| `GET` | `/api/ratings` | Get user's rating history | Yes (Bearer token) |
| `GET` | `/api/my-list` | Get user's saved watchlist | Yes (Bearer token) |
| `POST` | `/api/my-list/:movieId` | Add movie to watchlist | Yes (Bearer token) |
| `DELETE` | `/api/my-list/:movieId` | Remove movie from watchlist | Yes (Bearer token) |
| `GET` | `http://127.0.0.1:8000/health` | ML service health check | No |

---

## 💡 How AI Recommendations Work
1. **Cold Start**: When a new user logs in without ratings, popular starter movies are suggested.
2. **User Ratings**: When the user gives a star rating to movies (e.g. *Inception* 5★, *Interstellar* 5★), CineMatch vectors the user's taste profile using the learned movie embeddings from MovieLens.
3. **Real-time Inference**: The ML engine computes cosine similarity across all 27,000+ movie embeddings in PyTorch and instantly returns the top personalized recommendations.
=======
# movierecommendation
personalized movie recommendation
>>>>>>> 2c9063672e91f2e9cf95b53dc52ad1a9dac933e3
