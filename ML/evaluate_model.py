import pandas as pd
import torch
import torch.nn as nn
import math


# =========================
# Configuration
# =========================

TEST_FILE = "dataset/test.csv"
MODEL_FILE = "cinematch_model.pth"

BATCH_SIZE = 65536


# =========================
# Check GPU
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
# Load trained model
# =========================

print("\nLoading trained model...")

checkpoint = torch.load(
    MODEL_FILE,
    map_location=device,
    weights_only=False
)

user_to_index = checkpoint["user_to_index"]
movie_to_index = checkpoint["movie_to_index"]

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
# Load test data
# =========================

print("\nLoading test data...")

df = pd.read_csv(TEST_FILE)

print("Test ratings:", len(df))


# =========================
# Convert IDs
# =========================

df["user_idx"] = df["userId"].map(user_to_index)
df["movie_idx"] = df["movieId"].map(movie_to_index)


# Remove movies/users not seen during training
df = df.dropna(
    subset=["user_idx", "movie_idx"]
)

df["user_idx"] = df["user_idx"].astype(int)
df["movie_idx"] = df["movie_idx"].astype(int)

print("Ratings used for evaluation:", len(df))


# =========================
# Convert to tensors
# =========================

users = torch.tensor(
    df["user_idx"].values,
    dtype=torch.long
)

movies = torch.tensor(
    df["movie_idx"].values,
    dtype=torch.long
)

ratings = torch.tensor(
    df["rating"].values,
    dtype=torch.float32
)


# =========================
# Evaluation
# =========================

total_squared_error = 0.0
total_absolute_error = 0.0
total_samples = 0

print("\nEvaluating model...\n")

with torch.no_grad():

    for start in range(
        0,
        len(users),
        BATCH_SIZE
    ):

        batch_users = users[
            start:start + BATCH_SIZE
        ].to(device)

        batch_movies = movies[
            start:start + BATCH_SIZE
        ].to(device)

        batch_ratings = ratings[
            start:start + BATCH_SIZE
        ].to(device)

        predictions = model(
            batch_users,
            batch_movies
        )

        squared_error = (
            (predictions - batch_ratings) ** 2
        ).sum().item()

        absolute_error = (
            torch.abs(
                predictions - batch_ratings
            )
        ).sum().item()

        total_squared_error += squared_error
        total_absolute_error += absolute_error

        total_samples += len(batch_ratings)

        if total_samples % 500000 < BATCH_SIZE:
            print(
                f"Evaluated: {total_samples:,} / {len(users):,}"
            )


# =========================
# Metrics
# =========================

mse = total_squared_error / total_samples

rmse = math.sqrt(mse)

mae = total_absolute_error / total_samples


print("\n================================")
print("MODEL EVALUATION")
print("================================")

print(f"MAE:  {mae:.4f}")
print(f"RMSE: {rmse:.4f}")

print("================================")