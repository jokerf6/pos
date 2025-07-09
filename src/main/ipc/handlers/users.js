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
    throw new Error("صلاحيات غير صحيحة (يجب أن تكون: cashier, admin, manager)");
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

async function getAll() {
  try {
    const db = getDatabase();

    // Find user in database
    const [users] = await db.execute("SELECT * FROM users");

    return {
      success: true,
      users,
    };
  } catch (error) {
    log.error("users error:", error.message);
    throw error;
  }
}

async function getByName(name) {
  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username LIKE ?",
      [`%${name}%`]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: "No users found",
      };
    }

    return {
      success: true,
      users: rows,
    };
  } catch (error) {
    log.error("users error:", error.message);
    throw error;
  }
}

async function findById(event, id) {
  try {
    const db = getDatabase();

    // Find user in database
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      user: rows[0],
    };
  } catch (error) {
    log.error("users error:", error.message);
    throw error;
  }
}

export { createUser, getAll, findById, getByName };
