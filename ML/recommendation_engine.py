import re
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F


# ==========================================
# Configuration
# ==========================================

MODEL_FILE = "cinematch_model.pth"
MOVIE_FILE = "dataset/movie.csv"

TOP_K = 10


# ==========================================
# Recommendation Model
# ==========================================

class MovieRecommendationModel(nn.Module):

    def __init__(
        self,
        num_users,
        num_movies,
        embedding_size,
        global_mean
    ):
        super().__init__()

        self.user_embedding = nn.Embedding(
            num_users,
            embedding_size
        )

        self.movie_embedding = nn.Embedding(
            num_movies,
            embedding_size
        )

        self.user_bias = nn.Embedding(
            num_users,
            1
        )

        self.movie_bias = nn.Embedding(
            num_movies,
            1
        )

        self.global_mean = global_mean

    def forward(
        self,
        user_idx,
        movie_idx
    ):

        user_vector = self.user_embedding(
            user_idx
        )

        movie_vector = self.movie_embedding(
            movie_idx
        )

        user_bias = self.user_bias(
            user_idx
        ).squeeze(-1)

        movie_bias = self.movie_bias(
            movie_idx
        ).squeeze(-1)

        interaction = (
            user_vector * movie_vector
        ).sum(dim=1)

        return (
            self.global_mean
            + user_bias
            + movie_bias
            + interaction
        )


# ==========================================
# Recommendation Engine
# ==========================================

class RecommendationEngine:

    def __init__(self):

        print("Loading CineMatch recommendation engine...")

        self.device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        print(
            "Device:",
            self.device
        )

        if torch.cuda.is_available():

            print(
                "GPU:",
                torch.cuda.get_device_name(0)
            )

        # ----------------------------------
        # Load model checkpoint
        # ----------------------------------

        self.checkpoint = torch.load(
            MODEL_FILE,
            map_location=self.device,
            weights_only=False
        )

        # ----------------------------------
        # Create model
        # ----------------------------------

        self.model = MovieRecommendationModel(
            self.checkpoint["num_users"],
            self.checkpoint["num_movies"],
            self.checkpoint["embedding_size"],
            self.checkpoint["global_mean"]
        ).to(self.device)

        self.model.load_state_dict(
            self.checkpoint["model_state_dict"]
        )

        self.model.eval()

        # ----------------------------------
        # Load mappings
        # ----------------------------------

        self.movie_to_index = (
            self.checkpoint["movie_to_index"]
        )

        self.index_to_movie = {
            index: movie_id
            for movie_id, index
            in self.movie_to_index.items()
        }

        self.user_to_index = (
            self.checkpoint["user_to_index"]
        )

        # ----------------------------------
        # Load movie database
        # ----------------------------------

        self.movies_df = pd.read_csv(
            MOVIE_FILE
        )

        self.movie_titles = dict(
            zip(
                self.movies_df["movieId"],
                self.movies_df["title"]
            )
        )

        # ----------------------------------
        # Normalized title lookup
        # ----------------------------------

        # Prioritize movies that exist in the trained model
        sorted_movie_ids = sorted(
            self.movie_titles.keys(),
            key=lambda mid: (0 if mid in self.movie_to_index else 1, mid)
        )

        self.normalized_movie_ids = {}

        for movie_id in sorted_movie_ids:
            title = self.movie_titles[movie_id]
            for variant in self.get_title_variants(title):
                if variant not in self.normalized_movie_ids:
                    self.normalized_movie_ids[variant] = movie_id
                elif (
                    self.normalized_movie_ids[variant] not in self.movie_to_index
                    and movie_id in self.movie_to_index
                ):
                    self.normalized_movie_ids[variant] = movie_id

        # ----------------------------------
        # Pre-normalize movie embeddings
        # ----------------------------------

        with torch.no_grad():

            self.normalized_movie_embeddings = (
                F.normalize(
                    self.model.movie_embedding.weight,
                    dim=1
                )
            )

        print(
            "CineMatch recommendation engine "
            "loaded successfully!"
        )


    # ======================================
    # Normalize movie title
    # ======================================

    def normalize_title(self, title):

        title = str(title).lower().strip()

        title = re.sub(
            r"\s*\(\d{4}\)\s*$",
            "",
            title
        )

        return title


    # ======================================
    # Title variants
    # ======================================

    def get_title_variants(self, title):
        norm = self.normalize_title(title)
        variants = {norm}

        for suffix, prefix in [(", the", "the "), (", a", "a "), (", an", "an ")]:
            if norm.endswith(suffix):
                base = norm[:-len(suffix)].strip()
                variants.add(prefix + base)
                variants.add(base)
            elif norm.startswith(prefix):
                base = norm[len(prefix):].strip()
                variants.add(base + suffix)
                variants.add(base)

        return list(variants)


    # ======================================
    # Find movie ID
    # ======================================

    def get_movie_id(self, title):
        if not title:
            return None

        if isinstance(title, int) or (isinstance(title, str) and title.strip().isdigit()):
            candidate = int(title)
            if candidate in self.movie_to_index or candidate in self.movie_titles:
                return candidate

        title_str = str(title).strip()
        variants = self.get_title_variants(title_str)

        for var in variants:
            if var in self.normalized_movie_ids:
                return self.normalized_movie_ids[var]

        return None


    # ======================================
    # New User Recommendations
    # ======================================

    def recommend_for_new_user(
        self,
        ratings,
        top_k=TOP_K
    ):
        """
        Generate recommendations for a
        brand-new user.

        Example:

        ratings = {
            "Interstellar": 5,
            "Inception": 5,
            "The Matrix": 4
        }
        or
        ratings = {
            109487: 5,
            79132: 5
        }
        """

        if isinstance(ratings, list):
            new_ratings = {}
            for item in ratings:
                if isinstance(item, dict):
                    m_id = item.get("movieId") or item.get("movie_id") or item.get("title")
                    r_val = item.get("rating")
                    if m_id is not None and r_val is not None:
                        new_ratings[m_id] = r_val
            ratings = new_ratings

        if not isinstance(ratings, dict):
            return []

        movie_indices = []
        rating_values = []

        # ----------------------------------
        # Convert IDs / titles to model indices
        # ----------------------------------

        for key, rating in ratings.items():

            movie_id = None

            if isinstance(key, int) or (isinstance(key, str) and key.strip().isdigit()):
                candidate = int(key)
                if candidate in self.movie_to_index:
                    movie_id = candidate

            if movie_id is None:
                movie_id = self.get_movie_id(str(key))

            if movie_id is None:
                continue

            if movie_id not in self.movie_to_index:
                continue

            movie_index = self.movie_to_index[
                movie_id
            ]

            movie_indices.append(
                movie_index
            )

            rating_values.append(
                float(rating)
            )

        # ----------------------------------
        # Safety check
        # ----------------------------------

        if len(movie_indices) == 0:

            return []

        # ----------------------------------
        # Tensors
        # ----------------------------------

        movie_tensor = torch.tensor(
            movie_indices,
            dtype=torch.long,
            device=self.device
        )

        rating_tensor = torch.tensor(
            rating_values,
            dtype=torch.float32,
            device=self.device
        )

        # ----------------------------------
        # Build user preference profile
        # ----------------------------------

        with torch.no_grad():

            rated_embeddings = (
                self.model.movie_embedding(
                    movie_tensor
                )
            )

            # 3 stars = neutral
            #
            # 5 stars = strong positive
            #
            # 1 star = strong negative

            weights = (
                rating_tensor - 3.0
            )

            # If all ratings are exactly
            # 3 stars, use equal weights.

            if torch.sum(
                torch.abs(weights)
            ).item() == 0:

                weights = torch.ones_like(
                    weights
                )

            user_profile = (
                rated_embeddings
                * weights.unsqueeze(1)
            ).sum(dim=0)

            user_profile = (
                user_profile
                / torch.sum(
                    torch.abs(weights)
                )
            )

            user_profile = F.normalize(
                user_profile,
                dim=0
            )

            # ----------------------------------
            # Calculate cosine similarity
            # ----------------------------------

            similarities = torch.matmul(
                self.normalized_movie_embeddings,
                user_profile
            )

        # ----------------------------------
        # Remove already-rated movies
        # ----------------------------------

        for movie_index in movie_indices:

            similarities[
                movie_index
            ] = -999

        # ----------------------------------
        # Top recommendations
        # ----------------------------------

        top_values, top_indices = torch.topk(
            similarities,
            top_k
        )

        recommendations = []

        for position in range(top_k):

            movie_index = (
                top_indices[position].item()
            )

            movie_id = self.index_to_movie.get(
                movie_index
            )

            if movie_id is None:
                continue

            title = self.movie_titles.get(
                movie_id,
                "Unknown Movie"
            )

            similarity = (
                top_values[position].item()
            )

            recommendations.append({
                "movieId": int(movie_id),
                "title": title,
                "similarity": round(
                    float(similarity),
                    4
                )
            })

        return recommendations


# ==========================================
# Test
# ==========================================

if __name__ == "__main__":

    engine = RecommendationEngine()

    test_ratings = {

        "Interstellar": 5,

        "Inception": 5,

        "The Matrix": 4,

        "Arrival": 5,

        "The Dark Knight": 4
    }

    recommendations = (
        engine.recommend_for_new_user(
            test_ratings,
            top_k=10
        )
    )

    print("\n")
    print(
        "========================================"
    )

    print(
        "       [CINEMATCH RECOMMENDATIONS]"
    )

    print(
        "========================================"
    )

    for index, movie in enumerate(
        recommendations,
        start=1
    ):

        print(
            f"{index}. "
            f"{movie['title']} "
            f"[score: {movie['similarity']:.3f}]"
        )

    print(
        "========================================"
    )
