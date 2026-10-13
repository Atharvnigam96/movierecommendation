import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..", "..");
const csvPath = path.join(projectRoot, "ML", "dataset", "movie.csv");
const dbPath = path.join(__dirname, "..", "cinematch.db");

if (!fs.existsSync(csvPath)) {
  console.error("Could not find:", csvPath);
  console.error("Make sure the project structure contains ML/dataset/movie.csv");
  process.exit(1);
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    movie_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    genres TEXT NOT NULL DEFAULT ''
  );
`);

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

const insert = db.prepare(`
  INSERT INTO movies (movie_id, title, genres)
  VALUES (?, ?, ?)
  ON CONFLICT(movie_id)
  DO UPDATE SET title = excluded.title, genres = excluded.genres
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(...row);
});

const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split(/\r?\n/).filter(Boolean);

let rows = [];
let count = 0;

for (let i = 1; i < lines.length; i++) {
  const [movieId, title, genres] = parseCsvLine(lines[i]);

  if (!movieId || !title) continue;

  rows.push([
    Number(movieId),
    title,
    genres || ""
  ]);

  if (rows.length === 1000) {
    insertMany(rows);
    count += rows.length;
    rows = [];
  }
}

if (rows.length) {
  insertMany(rows);
  count += rows.length;
}

console.log(`Imported ${count} movies.`);
db.close();