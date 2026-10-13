import pandas as pd
import torch
import torch.nn as nn


# =========================
# Configuration
# =========================

MODEL_FILE = "cinematch_model.pth"
MOVIE_FILE = "dataset/movie.csv"
TRAIN_FILE = "dataset/train.csv"

TOP_K = 10


# =========================
# Device
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))


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

    def forward(self, user_idx, movie_idx):

        user_vector = self.user_embedding(user_idx)

        movie_vector = self.movie_embedding(movie_idx)

        user_bias = self.user_bias(
            user_idx
        ).squeeze(-1)

        movie_bias = self.movie_bias(
            movie_idx
        ).squeeze(-1)

        interaction = (
            user_vector * movie_vector
        ).sum(dim=1)

        prediction = (
            self.global_mean
            + user_bias
            + movie_bias
            + interaction
        )

        return prediction


# =========================
# Load model
# =========================

print("\nLoading model...")

checkpoint = torch.load(
    MODEL_FILE,
    map_location=device,
    weights_only=False
)

user_to_index = checkpoint["user_to_index"]
movie_to_index = checkpoint["movie_to_index"]

index_to_movie = {
    index: movie_id
    for movie_id, index in movie_to_index.items()
}


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
# Load movie information
# =========================

print("\nLoading movies...")

movies_df = pd.read_csv(MOVIE_FILE)

movie_titles = dict(
    zip(
        movies_df["movieId"],
        movies_df["title"]
    )
)

print("Movies loaded:", len(movies_df))


# =========================
# Get user
# =========================

print("\nAvailable user IDs:")
print("1 - 138493")

user_id = int(
    input("\nEnter MovieLens user ID: ")
)


if user_id not in user_to_index:

    print(
        "\nUser not found in the training data."
    )

    exit()


user_idx = user_to_index[user_id]


# =========================
# Find movies already watched
# =========================

print("\nFinding movies already rated...")

train_df = pd.read_csv(
    TRAIN_FILE,
    usecols=["userId", "movieId"]
)

watched_movies = set(
    train_df.loc[
        train_df["userId"] == user_id,
        "movieId"
    ]
)

print(
    "Movies already rated:",
    len(watched_movies)
)


# =========================
# Create candidate movies
# =========================

candidate_indices = []
candidate_movie_ids = []

for movie_idx, movie_id in index_to_movie.items():

    if movie_id not in watched_movies:

        candidate_indices.append(movie_idx)
        candidate_movie_ids.append(movie_id)


# =========================
# Score movies
# =========================

print("\nGenerating recommendations...")

user_tensor = torch.full(
    (len(candidate_indices),),
    user_idx,
    dtype=torch.long,
    device=device
)

movie_tensor = torch.tensor(
    candidate_indices,
    dtype=torch.long,
    device=device
)


with torch.no_grad():

    predictions = model(
        user_tensor,
        movie_tensor
    )


# =========================
# Get top movies
# =========================

top_values, top_indices = torch.topk(
    predictions,
    TOP_K
)


print("\n")
print("========================================")
print("       [CINEMATCH RECOMMENDATIONS]")
print("========================================")

for rank in range(TOP_K):

    position = top_indices[rank].item()

    movie_id = candidate_movie_ids[position]

    title = movie_titles.get(
        movie_id,
        "Unknown Movie"
    )

    predicted_rating = top_values[
        rank
    ].item()

    # Keep rating within MovieLens range
    predicted_rating = max(
        0.5,
        min(5.0, predicted_rating)
    )

    print(
        f"{rank + 1:2}. "
        f"{title} "
        f"[rating: {predicted_rating:.2f}]"
    )

print("========================================")