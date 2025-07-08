import bcrypt from "bcryptjs";
import log from "electron-log";
import { getDatabase } from "../../database/connection.js";

/**
 * Login handler
 */
async function createUser(event, credentials) {
  const { username, password, role } = credentials;

  // Validate input
  if (!username || !password || !role) {
    throw new Error("Fields Missed");
  }
  if (role !== "cashier" && role !== "admin" && role !== "manager") {
    throw new Error("Invalid role");
  }

  try {
    const db = getDatabase();

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await db.execute(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, passwordHash, role]
    );

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    log.error("User creation error:", error.message);
    throw error;
  }
}

export { createUser };
