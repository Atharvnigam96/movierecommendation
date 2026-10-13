import pandas as pd

INPUT_FILE = "dataset/rating.csv"
OUTPUT_FILE = "dataset/ratings_clean.csv"

print("Starting dataset cleaning...")

total_rows = 0
cleaned_rows = 0
duplicate_rows = 0

first_chunk = True

for chunk in pd.read_csv(INPUT_FILE, chunksize=500_000):

    total_rows += len(chunk)

    # Remove exact duplicate ratings
    before = len(chunk)

    chunk = chunk.drop_duplicates(
        subset=["userId", "movieId", "rating", "timestamp"]
    )

    duplicate_rows += before - len(chunk)

    # Use smaller numeric types to reduce memory usage
    chunk["userId"] = chunk["userId"].astype("int32")
    chunk["movieId"] = chunk["movieId"].astype("int32")
    chunk["rating"] = chunk["rating"].astype("float32")

    # Keep only valid MovieLens ratings
    chunk = chunk[
        (chunk["rating"] >= 0.5) &
        (chunk["rating"] <= 5.0)
    ]

    cleaned_rows += len(chunk)

    # Save the cleaned chunk
    chunk.to_csv(
        OUTPUT_FILE,
        mode="w" if first_chunk else "a",
        header=first_chunk,
        index=False
    )

    first_chunk = False

    print(
        f"Processed: {total_rows:,} | "
        f"Kept: {cleaned_rows:,}"
    )

print("\n===== CLEANING COMPLETE =====")

print(f"Original rows: {total_rows:,}")
print(f"Cleaned rows: {cleaned_rows:,}")
print(f"Duplicate rows removed: {duplicate_rows:,}")
print(f"Rows removed: {total_rows - cleaned_rows:,}")

print(f"\nSaved to: {OUTPUT_FILE}")