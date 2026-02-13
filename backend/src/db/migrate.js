import fs from "fs";
import path from "path";
import { pool } from "./pool.js";

const MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

export async function runMigrations() {
  await pool.query(MIGRATIONS_TABLE_SQL);
  const dir = path.resolve("src/db/migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    const exists = await pool.query("SELECT 1 FROM schema_migrations WHERE version=$1", [version]);
    if (exists.rowCount) continue;

    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations(version) VALUES($1)", [version]);
  }
}
