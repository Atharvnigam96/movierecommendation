import re
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F


# =========================
# Configuration
# =========================

MODEL_FILE = "cinematch_model.pth"
MOVIE_FILE = "dataset/movie.csv"

TOP_K = 10


# =========================
# Device
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)

if torch.cuda.is_available():
    print(
        "GPU:",
        torch.cuda.get_device_name(0)
    )


# =========================
# Model
# =========================

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


# =========================
# Load trained model
# =========================

print("\nLoading trained model...")

checkpoint = torch.load(
    MODEL_FILE,
    map_location=device,
    weights_only=False
)

model = MovieRecommendationModel(
    checkpoint["num_users"],
    checkpoint["num_movies"],
    checkpoint["embedding_size"],
    checkpoint["global_mean"]
).to(device)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.eval()

print("Model loaded successfully!")


# =========================
# Load movies
# =========================

print("\nLoading movies...")

movies_df = pd.read_csv(
    MOVIE_FILE
)

movie_titles = dict(
    zip(
        movies_df["movieId"],
        movies_df["title"]
    )
)

movie_to_index = checkpoint[
    "movie_to_index"
]

index_to_movie = {
    index: movie_id
    for movie_id, index
    in movie_to_index.items()
}

print(
    "Movies loaded:",
    len(movies_df)
)


# =========================
# Normalize movie titles
# =========================

def normalize_title(title):

    title = title.lower().strip()

    # Remove year from the end.
    #
    # Interstellar (2014)
    # -> interstellar
    #
    title = re.sub(
        r"\s*\(\d{4}\)\s*$",
        "",
        title
    )

    return title


# =========================
# Movie title lookup
# =========================

normalized_movie_ids = {}

for movie_id, title in movie_titles.items():

    normalized_title = normalize_title(
        title
    )

    if normalized_title not in normalized_movie_ids:

        normalized_movie_ids[
            normalized_title
        ] = movie_id


# =========================
# NEW USER RATINGS
# =========================
#
# This simulates a brand-new
# CineMatch user.
#
# Later these will come from
# the React onboarding screen.
#

new_user_ratings = {

    "Interstellar": 5.0,

    "Inception": 5.0,

    "The Matrix": 4.0,

    "Arrival": 5.0,

    "The Dark Knight": 4.0
}


# =========================
# Convert ratings
# =========================

rating_movie_indices = []
rating_values = []

print("\nNew user's ratings:")

for title, rating in new_user_ratings.items():

    normalized_title = normalize_title(
        title
    )

    movie_id = normalized_movie_ids.get(
        normalized_title
    )

    if movie_id is None:

        print(
            f"Movie not found: {title}"
        )

        continue

    if movie_id not in movie_to_index:

        print(
            f"Movie not in training data: {title}"
        )

        continue

    movie_idx = movie_to_index[
        movie_id
    ]

    rating_movie_indices.append(
        movie_idx
    )

    rating_values.append(
        float(rating)
    )

    print(
        f"{title} → {rating:.1f} ⭐"
    )


# =========================
# Safety check
# =========================

if len(rating_movie_indices) == 0:

    print(
        "\nNo valid movie ratings found."
    )

    exit()


# =========================
# Convert to tensors
# =========================

movie_indices = torch.tensor(
    rating_movie_indices,
    dtype=torch.long,
    device=device
)

ratings = torch.tensor(
    rating_values,
    dtype=torch.float32,
    device=device
)


# =========================
# Create new user profile
# =========================

print(
    "\nCreating new user preference profile..."
)


with torch.no_grad():

    # Get embeddings of movies
    # the user rated.

    rated_movie_embeddings = (
        model.movie_embedding(
            movie_indices
        )
    )

    # Convert ratings into preference
    # weights.
    #
    # 5 stars -> strong positive signal
    # 4 stars -> positive signal
    # 3 stars -> neutral
    # 2 stars -> negative signal
    # 1 star -> strong negative signal

    weights = ratings - 3.0

    # Prevent all weights from
    # becoming zero.

    if torch.sum(
        torch.abs(weights)
    ) == 0:

        weights = torch.ones_like(
            weights
        )

    # Weighted average of movie
    # embeddings.

    user_profile = (
        rated_movie_embeddings
        * weights.unsqueeze(1)
    ).sum(dim=0)

    user_profile = (
        user_profile
        / torch.sum(torch.abs(weights))
    )


# =========================
# Normalize user profile
# =========================

user_profile = F.normalize(
    user_profile,
    dim=0
)


print(
    "New user profile created!"
)


# =========================
# Get all movie embeddings
# =========================

print(
    "\nCalculating movie similarities..."
)


with torch.no_grad():

    all_movie_embeddings = (
        model.movie_embedding.weight
    )

    # Normalize movie embeddings.

    normalized_movies = F.normalize(
        all_movie_embeddings,
        dim=1
    )

    # Cosine similarity.

    similarities = torch.matmul(
        normalized_movies,
        user_profile
    )


# =========================
# Remove movies already rated
# =========================

for movie_index in rating_movie_indices:

    similarities[movie_index] = -999


# =========================
# Get top recommendations
# =========================

top_values, top_indices = torch.topk(
    similarities,
    TOP_K
)


# =========================
# Display recommendations
# =========================

print("\n")

print(
    "========================================"
)

print(
    "     [NEW USER RECOMMENDATIONS]"
)

print(
    "========================================"
)

for rank in range(TOP_K):

    movie_index = top_indices[
        rank
    ].item()

    movie_id = index_to_movie.get(
        movie_index
    )

    title = movie_titles.get(
        movie_id,
        "Unknown Movie"
    )

    similarity = top_values[
        rank
    ].item()

    print(
        f"{rank + 1:2}. "
        f"{title} "
        f"[Similarity: {similarity:.3f}]"
    )


print(
    "========================================"
)
