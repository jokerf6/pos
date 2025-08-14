const { initDatabase, getDatabase } = require("./connection.js");
const fs = require("fs/promises");
const path = require("path");
const log = require("electron-log");
const { fileURLToPath } = require("url");

const __filename = __filename || fileURLToPath(require.main.filename);
const __dirname = __dirname || path.dirname(__filename);

async function runMigrations() {
  log.info("Starting database migrations...");
  await initDatabase(); // Initialize database before running migrations
  const db = getDatabase();

}

// This allows running the migration script directly
if (require.main === module) {
  runMigrations()
    .then(() => console.log("Migrations completed."))
    .catch(err => console.error("Migrations failed:", err));
}

module.exports = { runMigrations };


