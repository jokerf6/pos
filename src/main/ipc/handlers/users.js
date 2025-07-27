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
    throw new Error("برجاء إدخال اسم المستخدم وكلمة المرور والدور");
  }
  if (role !== "cashier" && role !== "admin" && role !== "manager") {
    throw new Error("صلاحيات غير صحيحة (يجب أن تكون: cashier, admin)");
  }

  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username LIKE ?",
      [`%${username}%`]
    );
    if (rows.length > 0) {
      throw new Error("اسم المستخدم موجود بالفعل");
    }
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

async function getAll(
  event,
  { page = 1, limit = 10 } = { page: 1, limit: 10 }
) {
  try {
    const db = getDatabase();
    console.log(page, limit);
    const offset = (page - 1) * limit;

    // Find user in database
    const [users] = await db.execute("SELECT * FROM users LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    const [rows] = await db.execute("SELECT COUNT(*) as total FROM users");
    console.log("Total users:", users);
    return {
      success: true,
      users,
      total: rows[0].total,
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

async function findById(event, { id }) {
  try {
    const db = getDatabase();
    console.log("Finding user by ID:", id);
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

async function search(
  event,
  { name, page = 1, limit = 10 } = { name: "", page: 1, limit: 10 }
) {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // Find user in database
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username LIKE ? LIMIT ? OFFSET ?",
      [`%${name}%`, limit, offset]
    );
    const [search] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE username LIKE ?",
      [`%${name}%`]
    );

    return {
      success: true,
      users: rows,
      total: search[0].total,
    };
  } catch (error) {
    log.error("users error:", error.message);
    throw error;
  }
}

async function update(event, user) {
  console.log("Updating user:", user);
  const { id, username, password, role } = user;

  // Validate input
  if (!username || !password || !role) {
    throw new Error("برجاء إدخال اسم المستخدم وكلمة المرور والدور");
  }
  if (role !== "cashier" && role !== "admin" && role !== "manager") {
    throw new Error("صلاحيات غير صحيحة (يجب أن تكون: cashier, admin)");
  }

  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username LIKE ?",
      [`%${username}%`]
    );
    if (rows.length > 0 && rows[0].id !== id) {
      throw new Error("اسم المستخدم موجود بالفعل");
    }
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await db.execute(
      "UPDATE users SET username = ?, password_hash = ?, role = ? WHERE id = ?",
      [username, passwordHash, role, id]
    );

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    log.error("User updated error:", error.message);
    throw error;
  }
}

async function deleteUser(event, id) {
  // Validate input
  if (!id) {
    throw new Error("مستخدم غير موجود");
  }

  try {
    const db = getDatabase();
    const [rows] = await db.execute("SELECT * FROM users WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("مستخدم غير موجود");
    }
    await db.execute("DELETE FROM users WHERE id LIKE ?", [`%${id}%`]);

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    log.error("User deleted error:", error.message);
    throw error;
  }
}
export { createUser, getAll, findById, getByName, search, update, deleteUser };
