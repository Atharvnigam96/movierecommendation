import pandas as pd

print("Loading dataset...")

ratings = pd.read_csv("dataset/rating.csv")
movies = pd.read_csv("dataset/movie.csv")

print("\n===== RATINGS =====")
print("Rows:", len(ratings))
print("Columns:", list(ratings.columns))

print("\nFirst 5 ratings:")
print(ratings.head())

print("\nMissing values:")
print(ratings.isnull().sum())

print("\nDuplicate rows:", ratings.duplicated().sum())

print("\nRating distribution:")
print(ratings["rating"].value_counts().sort_index())

print("\n===== MOVIES =====")
print("Rows:", len(movies))
print("Columns:", list(movies.columns))

print("\nFirst 5 movies:")
print(movies.head())

print("\nMissing values:")
print(movies.isnull().sum())

print("\nDuplicate rows:", movies.duplicated().sum())

print("\n===== BASIC STATISTICS =====")
print("Unique users:", ratings["userId"].nunique())
print("Unique movies rated:", ratings["movieId"].nunique())
print("Average rating:", round(ratings["rating"].mean(), 3))
print("Minimum rating:", ratings["rating"].min())
print("Maximum rating:", ratings["rating"].max())

print("\n===== DATE RANGE =====")

ratings["timestamp"] = pd.to_datetime(
    ratings["timestamp"],
    unit="s"
)

print("First rating:", ratings["timestamp"].min())
print("Last rating:", ratings["timestamp"].max())

print("\nInspection complete!")