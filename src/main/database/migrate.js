import { initDatabase, getDatabase } from "./connection.js";
import fs from "fs/promises";
import path from "path";
import log from "electron-log";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  log.info("Starting database migrations...");
  await initDatabase(); // Initialize database before running migrations
  const db = getDatabase();

}

// This allows running the migration script directly
if (process.argv[1] === import.meta.url.replace("file://", "")) {
  runMigrations()
    .then(() => console.log("Migrations completed."))
    .catch(err => console.error("Migrations failed:", err));
}

export { runMigrations };


