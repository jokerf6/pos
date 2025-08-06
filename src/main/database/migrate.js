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

  try {
    // Read the permissions.sql file
    const permissionsSql = await fs.readFile(path.join(__dirname, "permissions.sql"), "utf8");

    // Split SQL into individual statements and filter out comments and empty lines
    const statements = permissionsSql.split(";").map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.startsWith("INSERT INTO permissions")) {
        // For INSERT statements, check if the permission already exists
        const match = statement.match(/\(\'([^\']+)\'/);
        if (match && match[1]) {
          const permissionName = match[1];
          const [rows] = await db.execute("SELECT id FROM permissions WHERE name = ?", [permissionName]);
          if (rows.length === 0) {
            await db.execute(statement);
            log.info(`Inserted permission: ${permissionName}`);
          } else {
            log.info(`Permission already exists, skipping insert: ${permissionName}`);
          }
        }
      } else {
        // For other statements (CREATE TABLE, ALTER TABLE), execute directly
        await db.execute(statement);
      }
    }

    log.info("All migrations processed.");
  } catch (error) {
    log.error("Database migration failed:", error.message);
    throw error;
  } finally {
    // It's good practice to close the connection if it's not managed globally
    // However, in this Electron app, the connection might be persistent.
    // If db.end() is called here, it might affect other parts of the app.
    // For now, assume getDatabase() manages a persistent connection.
  }
}

// This allows running the migration script directly
if (process.argv[1] === import.meta.url.replace("file://", "")) {
  runMigrations()
    .then(() => console.log("Migrations completed."))
    .catch(err => console.error("Migrations failed:", err));
}

export { runMigrations };


