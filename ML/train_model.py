import pandas as pd
import torch
import torch.nn as nn


# =========================
# Configuration
# =========================

TRAIN_FILE = "dataset/train.csv"

EMBEDDING_SIZE = 64
BATCH_SIZE = 65536
EPOCHS = 10
LEARNING_RATE = 0.001
WEIGHT_DECAY = 1e-5


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
# Load training data
# =========================

print("\nLoading training data...")

df = pd.read_csv(TRAIN_FILE)

print("Training rows:", len(df))


# =========================
# Create ID mappings
# =========================

user_ids = df["userId"].unique()
movie_ids = df["movieId"].unique()

user_to_index = {
    user_id: index
    for index, user_id in enumerate(user_ids)
}

movie_to_index = {
    movie_id: index
    for index, movie_id in enumerate(movie_ids)
}

df["user_idx"] = df["userId"].map(user_to_index)
df["movie_idx"] = df["movieId"].map(movie_to_index)

num_users = len(user_ids)
num_movies = len(movie_ids)

print("Number of users:", num_users)
print("Number of movies:", num_movies)


# =========================
# Global average rating
# =========================

global_mean = df["rating"].mean()

print("Global average rating:", global_mean)


# =========================
# Recommendation Model
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

        # Small initialization
        nn.init.normal_(
            self.user_embedding.weight,
            mean=0.0,
            std=0.01
        )

        nn.init.normal_(
            self.movie_embedding.weight,
            mean=0.0,
            std=0.01
        )

        # Start biases at zero
        nn.init.zeros_(
            self.user_bias.weight
        )

        nn.init.zeros_(
            self.movie_bias.weight
        )

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
# Create model
# =========================

model = MovieRecommendationModel(
    num_users,
    num_movies,
    EMBEDDING_SIZE,
    global_mean
).to(device)

print("\nModel created successfully!")

print(
    "Parameters:",
    sum(
        p.numel()
        for p in model.parameters()
    )
)


# =========================
# Loss + Optimizer
# =========================

criterion = nn.MSELoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# =========================
# Prepare tensors
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
# Training
# =========================

print("\nStarting training...\n")

for epoch in range(EPOCHS):

    model.train()

    total_loss = 0.0
    num_batches = 0

    permutation = torch.randperm(
        len(users)
    )

    for start in range(
        0,
        len(users),
        BATCH_SIZE
    ):

        indices = permutation[
            start:start + BATCH_SIZE
        ]

        batch_users = users[
            indices
        ].to(device)

        batch_movies = movies[
            indices
        ].to(device)

        batch_ratings = ratings[
            indices
        ].to(device)

        optimizer.zero_grad()

        predictions = model(
            batch_users,
            batch_movies
        )

        loss = criterion(
            predictions,
            batch_ratings
        )

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

        num_batches += 1

        if num_batches % 50 == 0:

            print(
                f"Epoch {epoch + 1}/{EPOCHS} "
                f"| Batch {num_batches} "
                f"| Loss: {loss.item():.4f}"
            )

    average_loss = (
        total_loss / num_batches
    )

    print(
        f"\nEpoch {epoch + 1} complete "
        f"| Average Loss: {average_loss:.4f}\n"
    )


# =========================
# Save model
# =========================

torch.save(
    {
        "model_state_dict":
            model.state_dict(),

        "user_to_index":
            user_to_index,

        "movie_to_index":
            movie_to_index,

        "num_users":
            num_users,

        "num_movies":
            num_movies,

        "embedding_size":
            EMBEDDING_SIZE,

        "global_mean":
            global_mean,
    },
    "cinematch_model.pth"
)


print("================================")
print("TRAINING COMPLETE!")
print("Model saved as cinematch_model.pth")
print("================================")