import pandas as pd

INPUT_FILE = "dataset/ratings_clean.csv"

TRAIN_FILE = "dataset/train.csv"
TEST_FILE = "dataset/test.csv"

print("Loading cleaned ratings...")

ratings = pd.read_csv(INPUT_FILE)

print("Total ratings:", len(ratings))

# Convert timestamp to datetime
ratings["timestamp"] = pd.to_datetime(
    ratings["timestamp"],
    unit="s"
)

# Sort each user's ratings chronologically
ratings = ratings.sort_values(
    ["userId", "timestamp"]
)

# Last 20% of each user's ratings go to test
test_mask = (
    ratings
    .groupby("userId")
    .cumcount(ascending=False)
    < (ratings.groupby("userId")["userId"].transform("count") * 0.2).astype(int)
)

test = ratings[test_mask]
train = ratings[~test_mask]

print("\n===== SPLIT COMPLETE =====")

print("Training ratings:", len(train))
print("Testing ratings:", len(test))

print(
    "Training percentage:",
    round(len(train) / len(ratings) * 100, 2),
    "%"
)

print(
    "Testing percentage:",
    round(len(test) / len(ratings) * 100, 2),
    "%"
)

print("\nSaving files...")

train.to_csv(TRAIN_FILE, index=False)
test.to_csv(TEST_FILE, index=False)

print("\nSaved:")
print(TRAIN_FILE)
print(TEST_FILE)

print("\nDone!")