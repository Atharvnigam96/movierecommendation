# PROJECT SYNOPSIS

---

## 1. COVER PAGE DETAILS

- **Project Title:** CineMatch: Personalized Movie Recommendation System Using Deep Collaborative Filtering
- **Domain:** Artificial Intelligence / Machine Learning & Full-Stack Web Development
- **Student Name:** Atharv Nigam
- **Roll Number:** 2400320100324
- **Degree / Branch:** Bachelor of Technology (B.Tech) – Computer Science and Engineering (CSE)
- **Semester / Year:** 5th Semester / 3rd Year
- **Department:** Department of Computer Science & Engineering
- **College / Institution:** ABES Engineering College, Ghaziabad
- **Project Guide:** Independent Project / Self-Guided (Under Department of CSE Mentorship)
- **Academic Year:** 2025 – 2026

---

## 2. PROJECT TITLE

**CineMatch: A Personalized Movie Recommendation Web Platform Powered by Neural Embedding-Based Collaborative Filtering**

---

## 3. INTRODUCTION

In today's digital streaming era, users are overwhelmed by thousands of movies across multiple platforms. This "choice overload" makes finding content that aligns with personal preferences difficult and time-consuming. Traditional movie platforms often rely on rudimentary genre filters or global popularity rankings, failing to capture subtle nuances like directorial style, tone, and pacing.

**CineMatch** is an end-to-end full-stack movie recommendation web application. It combines a high-performance modern user interface with a deep learning recommendation model trained on over 20 million real-world user ratings. By mapping users and films into a learned latent feature space, the system provides real-time, personalized movie recommendations that continuously adapt as users rate films.

---

## 4. PROBLEM STATEMENT

Existing recommendation systems frequently suffer from three major shortcomings:
1. **Shallow Tag Matching:** Relying solely on genre tags (e.g., classifying both *Transformers* and *Inception* simply as "Sci-Fi/Action") fails to reflect actual audience reception and tone.
2. **Cold-Start Latency:** Retraining complex neural networks every time a new user rates a film is computationally prohibitive and cannot deliver instant feedback.
3. **Fragmented User Experience:** Many machine learning recommendation prototypes exist only as isolated Python notebooks or scripts without an intuitive, responsive frontend or a persistent user database.

There is a clear need for a unified web platform that integrates a pre-trained deep learning collaborative filtering engine with real-time vector inference, interactive user ratings, and watchlist management.

---

## 5. OBJECTIVES

- **To develop an intuitive, responsive web application** for browsing, searching, and managing movies.
- **To implement a neural collaborative filtering model** using PyTorch to learn 64-dimensional latent embeddings of movies from the MovieLens 20M dataset.
- **To eliminate the cold-start retraining bottleneck** by computing on-the-fly user taste vectors via weighted embedding aggregation.
- **To provide GPU-accelerated cosine similarity search** across 27,000+ movies with sub-30ms response times.
- **To build a secure REST API and database system** using Node.js, Express, and SQLite for user authentication, rating histories, and personalized watchlists.

---

## 6. PROPOSED SOLUTION

CineMatch solves the movie discovery problem through a three-tier architecture:

```
[ React / Vite UI ]  ◄──HTTP/REST──►  [ Node.js / Express API ]  ◄──HTTP/JSON──►  [ Python ML Service ]
 (Port 5173)                                (Port 5000)                                (Port 8000)
                                                 │                                          │
                                                 ▼                                          ▼
                                        [ SQLite Database ]                        [ PyTorch Model ]
                                         (cinematch.db)                          (cinematch_model.pth)
```

- **Interactive UI:** Users can browse over 27,000 films with 12 genre filters, perform real-time searches, view detailed movie synopses, and manage personal watchlists.
- **Dynamic Taste Adaptation:** When a user rates a movie (1 to 5 stars), the system assigns positive weights to favored titles and negative weights to disliked titles, building a normalized personal taste vector.
- **Real-Time Recommendation Delivery:** The Python microservice projects this taste vector against pre-normalized movie embeddings using matrix multiplication in PyTorch, immediately returning the top-ranked unseen films.

---

## 7. SCOPE OF THE PROJECT

### In Scope:
- User registration and JWT-based authentication.
- Full catalog exploration across 27,278 MovieLens movies with pagination and multi-genre filtering.
- Movie details view with dynamic ratings, synopses, cast info, and official trailer search links.
- Interactive 5-star rating system with instant database persistence.
- Watchlist management ("My List") allowing users to add/remove movies.
- User profile dashboard displaying statistics (ratings count, average rating, favorite genres).
- Offline model training on 20M ratings + live inference microservice.

### Out of Scope (Current Release):
- Video streaming or direct media playback (platform is an informational and discovery guide).
- Payment gateways or premium tier subscriptions.
- Native mobile applications (iOS/Android) — the system currently provides a responsive web application.

---

## 8. METHODOLOGY & WORKING

The system follows a combined software development and machine learning workflow:

### A. General Application Workflow
$$\text{User Action (Search/Rate)} \longrightarrow \text{React Frontend} \longrightarrow \text{Express REST API} \longrightarrow \text{SQLite Storage} \longrightarrow \text{Live Feed Update}$$

### B. Machine Learning Pipeline
$$\text{MovieLens 20M Dataset} \longrightarrow \text{Preprocessing \& Indexing} \longrightarrow \text{Embedding Model Training} \longrightarrow \text{Weight Export (.pth)} \longrightarrow \text{Cosine Similarity Engine}$$

### C. Step-by-Step Recommendation Algorithm:
1. **Cold Start:** For new visitors or guests with zero ratings, the system displays curated popular starter movies (*Interstellar*, *Inception*, *The Dark Knight*, *The Matrix*).
2. **Rating Weighting:** When a user rates movie $i$ with score $r_i \in [1, 5]$, the engine centers the rating around a neutral $3.0$ baseline:
   $$w_i = r_i - 3.0$$
   *(5★ yields $+2.0$ pull; 1★ yields $-2.0$ repulsion).*
3. **User Profile Aggregation:** A personalized taste vector $\mathbf{v}_{\text{user}}$ is computed:
   $$\mathbf{v}_{\text{user}} = \frac{\sum w_i \cdot \mathbf{m}_i}{\sum |w_i|}, \quad \hat{\mathbf{v}}_{\text{user}} = \frac{\mathbf{v}_{\text{user}}}{\|\mathbf{v}_{\text{user}}\|}$$
4. **GPU Similarity Search:** The engine computes the dot product of $\hat{\mathbf{v}}_{\text{user}}$ against all normalized movie embeddings $\mathbf{M}$:
   $$\mathbf{S} = \mathbf{M} \cdot \hat{\mathbf{v}}_{\text{user}}$$
5. **Deduplication & Top-K Extraction:** Already rated movies are masked out ($S_i = -999$), and PyTorch's `torch.topk` extracts the top 10 highest-scoring recommendations.

---

## 9. TECHNOLOGIES USED

| Category | Technology / Library | Purpose in Project |
|---|---|---|
| **Programming Languages** | Python 3.14, JavaScript (ES6+ / Node.js) | ML model & backend/frontend logic |
| **Frontend Framework** | React 19, React Router v7 | Single-page reactive user interface |
| **Frontend Build Tool** | Vite 8 | Ultra-fast bundling, HMR & proxy routing |
| **Styling** | Vanilla CSS3 (Custom Dark Cinema Design) | Responsive UI, transitions & layouts |
| **Backend Framework** | Node.js, Express 5 | REST API server, route handling & auth |
| **Database** | SQLite 3 (`better-sqlite3`) | High-speed local database with WAL mode |
| **Machine Learning** | PyTorch 2.14, Pandas, NumPy | Neural embedding architecture & tensor math |
| **Hardware Acceleration** | NVIDIA CUDA (RTX 3050 Laptop GPU) | GPU tensor operations for fast inference |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs | Secure password hashing and session tokens |
| **IDE & Tools** | VS Code, Git, Command Prompt / Git Bash | Code development, testing & version control |

---

## 10. MODULES DESCRIPTION

### Module 1 – Authentication & User Management
- Handles secure account registration and login.
- Hashes passwords using `bcryptjs` and signs session tokens using `jsonwebtoken`.
- Manages client-side session persistence in `localStorage` with automated token eviction on expiry.

### Module 2 – Movie Catalog & Exploration Engine
- Paginated catalog serving 27,278 movies with sub-second response times.
- Real-time 250ms debounced search by movie title.
- Multi-genre filtering across 12 primary film categories.
- Deterministic rating engine providing authentic ratings for classic and catalog films.

### Module 3 – User Engagement (Ratings & Watchlist)
- Interactive 5-star rating component on every movie detail view.
- Persistent watchlist ("My List") synced directly with SQLite table `my_list`.
- Real-time UI updates reflecting watchlist additions/removals with badge toggles.

### Module 4 – Neural Recommendation Microservice
- Dedicated Python HTTP service running on port 8000.
- Keeps model weights (`cinematch_model.pth`) and pre-normalized embeddings permanently in memory.
- Exposes `/recommendations/new-user` and `/health` endpoints with full CORS support.

### Module 5 – User Profile & Activity Dashboard
- Displays user statistics: total movies rated, watchlist count, and average rating given.
- Computes top favorite genres based on the user's rating history.
- Chronological list of rated films with links back to movie detail pages.

---

## 11. EXPECTED OUTCOME

- A fully functional, responsive web application accessible at `http://localhost:5173`.
- Instantaneous delivery of personalized recommendations (< 30ms inference time).
- Measurable improvement in user discovery over static genre sorting by reflecting nuanced taste profiles.
- Seamless single-command launch via `start.bat` automating the multi-service stack.

---

## 12. FUTURE SCOPE

1. **TMDB / OMDb Live API Integration:** Fetch real-time posters, trailers, and cast biographies directly via official APIs using the included `link.csv` dataset.
2. **Hybrid Recommendation Model:** Combine the collaborative filtering model with content-based Natural Language Processing (NLP) over movie synopses (e.g., using TF-IDF or BERT).
3. **Cloud Deployment:** Containerize the services using Docker and deploy to cloud platforms (AWS / Render / Vercel).
4. **Social & Sharing Features:** Enable users to share curated watchlists and compare taste compatibility with friends.
5. **Mobile Application:** Build a cross-platform mobile client using React Native utilizing the existing Express REST API.

---

## 13. REFERENCES

1. **F. Maxwell Harper and Joseph A. Konstan.** 2015. *The MovieLens Datasets: History and Context.* ACM Transactions on Interactive Intelligent Systems (TiiS) 5, 4, Article 19.
2. **He, X., Liao, L., Zhang, H., Nie, L., Hu, X., & Chua, T. S.** (2017). *Neural Collaborative Filtering.* Proceedings of the 26th International Conference on World Wide Web (WWW '17), pp. 173–182.
3. **PyTorch Documentation:** *Embedding Layers & Tensor Computations.* Official Documentation, [https://pytorch.org/docs](https://pytorch.org/docs).
4. **React Documentation:** *React 19 Hooks and Component Architecture.* [https://react.dev](https://react.dev).
5. **Express.js Guide:** *Building RESTful APIs with Node.js and Express.* [https://expressjs.com](https://expressjs.com).
6. **SQLite Documentation:** *An In-Process Database Engine with Write-Ahead Logging.* [https://sqlite.org](https://sqlite.org).
