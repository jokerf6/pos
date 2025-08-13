import bcrypt from "bcryptjs";
import log from "electron-log";
import { getDatabase } from "../../database/connection.js";

/**
 * Create user handler
 */
async function createUser(event, credentials) {
  const { username, password, permissions = [], createdBy } = credentials;

  // Validate input
  if (!username || !password) {
    throw new Error("برجاء إدخال اسم المستخدم وكلمة المرور");
  }

  try {
    const db = getDatabase();

    // Check if username already exists
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length > 0) {
      throw new Error("اسم المستخدم موجود بالفعل");
    }

    // Start transaction

    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create user (without role)
      const [result] = await db.execute(
        "INSERT INTO users (username, password_hash, active, created_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)",
        [username, passwordHash]
      );

      const userId = result.insertId;

      // Add permissions if provided
      if (permissions && permissions.length > 0) {
        const values = permissions.map(permissionId => [userId, permissionId, createdBy]);
        const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await db.execute(`
          INSERT INTO user_permissions (user_id, permission_id, granted_by)
          VALUES ${placeholders}
        `, flatValues);

        // Update permissions timestamp
  
      }

      // Commit transaction
      await db.execute('COMMIT');

      return {
        success: true,
        message: "تم إنشاء المستخدم بنجاح",
        userId: userId,
      };
    } catch (error) {
      // Rollback transaction
      await db.execute('ROLLBACK');
      throw error;
    }
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
    const offset = (page - 1) * limit;

    // Get users with their permissions count
    const [users] = await db.execute(`
      SELECT u.id, u.username, u.active, u.created_at, u.last_login,
             COUNT(up.permission_id) as permissions_count
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      GROUP BY u.id, u.username, u.active, u.created_at, u.last_login
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [rows] = await db.execute("SELECT COUNT(*) as total FROM users");
    
    return {
      success: true,
      users,
      total: rows[0].total,
    };
  } catch (error) {
    log.error("Get users error:", error.message);
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

async function getById(event,  id ) {
  try {
    const db = getDatabase();
    
    // Get user basic info
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (users.length === 0) {
      return {
        success: false,
        message: "المستخدم غير موجود",
      };
    }

    const user = users[0];

    // Get user permissions
    const [permissions] = await db.execute(`
      SELECT p.id, p.name, p.display_name, p.description, p.category,
             up.granted_at, up.granted_by
      FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = ?
      ORDER BY p.category, p.display_name
    `, [id]);

    return {
      success: true,
      user: {
        ...user,
        permissions: permissions,
      },
    };
  } catch (error) {
    log.error("Find user by ID error:", error.message);
    throw error;
  }
}

async function search(
  event,
 data
) {
  const { name, page = 1, limit = 10 } = data;
  try {
    console.log("searching for users with name:", data);
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
  const { id, username, password, permissions = [], updatedBy } = user;

  // Validate input
  if (!username) {
    throw new Error("برجاء إدخال اسم المستخدم");
  }

  try {
    const db = getDatabase();

    // Check if username already exists for another user
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ? AND id != ?",
      [username, id]
    );
    if (rows.length > 0) {
      throw new Error("اسم المستخدم موجود بالفعل");
    }

    // Start transaction

    try {
      // Update user basic info
      if (password) {
        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        await db.execute(
          "UPDATE users SET username = ?, password_hash = ? WHERE id = ?",
          [username, passwordHash, id]
        );
      } else {
        await db.execute(
          "UPDATE users SET username = ? WHERE id = ?",
          [username, id]
        );
      }

      // Update permissions
      // Remove all existing permissions
      await db.execute(
        "DELETE FROM user_permissions WHERE user_id = ?",
        [id]
      );

      // Add new permissions
      if (permissions && permissions.length > 0) {
        const values = permissions.map(permissionId => [id, permissionId, updatedBy]);
        const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await db.execute(`
          INSERT INTO user_permissions (user_id, permission_id, granted_by)
          VALUES ${placeholders}
        `, flatValues);
      }

    
      return {
        success: true,
        message: "تم تحديث المستخدم بنجاح",
      };
    } catch (error) {
      // Rollback transaction
      throw error;
    }
  } catch (error) {
    log.error("User update error:", error.message);
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
    
    // Check if user exists
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw new Error("مستخدم غير موجود");
    }

    // Start transaction

    try {
      // Delete user permissions first (due to foreign key constraint)
      await db.execute("DELETE FROM user_permissions WHERE user_id = ?", [id]);
      
      // Delete user
      await db.execute("DELETE FROM users WHERE id = ?", [id]);

      // Commit transaction

      return {
        success: true,
        message: "تم حذف المستخدم بنجاح",
      };
    } catch (error) {
      // Rollback transaction
      throw error;
    }
  } catch (error) {
    log.error("User deletion error:", error.message);
    throw error;
  }
}
export { createUser, getAll, getById, getByName, search, update, deleteUser };
