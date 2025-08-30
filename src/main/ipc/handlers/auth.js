const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const Store = require("electron-store");

// JWT secret - in production, this should be loaded from environment variables
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = "24h";

// Current session storage
let currentSession = null;

/**
 * Login handler
 */
async function login(event, credentials) {
  log.info("Login attempt for user:", credentials.username);

  const { username, password } = credentials;

  // Validate input
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  try {
    const db = getDatabase();
    const store = new Store();

    // Find user in database
const user = await db.get(
  `
  SELECT 
    u.id, 
    u.username, 
    u.password_hash, 
    u.role, 
    u.created_at,
    COALESCE(GROUP_CONCAT(p.name), '') as permissions
  FROM users u
  LEFT JOIN user_permissions up ON u.id = up.user_id
  LEFT JOIN permissions p ON up.permission_id = p.id
  WHERE u.username = ? AND u.active = 1
  GROUP BY u.id
  `,
  [username]
);

if (user && user.permissions) {
  user.permissions = user.permissions.split(",");
} else {
  user.permissions = [];
}

    if (!user) {
      log.warn("Login failed: User not found:", username);
      throw new Error("Invalid username or password");
    }

    if (user.id !== undefined && user.id !== null) {
      store.set("user.id", user.id);
    } else {
      // 如果 user.id 是 undefined/null，使用 delete 清除值
      store.delete("user.id");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      log.warn("Login failed: Invalid password for user:", username);
      throw new Error("Invalid username or password");
    }

const permissionsRows = await db.all(`
  SELECT p.name 
  FROM user_permissions up 
  JOIN permissions p ON up.permission_id = p.id 
  WHERE up.user_id = ?
`,[user.id]);
const permissions = permissionsRows? permissionsRows?.map((row) => row.name):[];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Store session
    currentSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions,
        branchId: user.branchId,

      token: token,
      loginTime: new Date(),
    };

    // Update last login time
    await db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [
      user.id,
    ]);

    log.info("Login successful for user:", username);

    return {
      success: true,
      user: {
        id: user.id,
        branchId: user.branchId,
        username: user.username,
        role: user.role,
        permissions, // ✅ إرجاع الصلاحيات هنا
      },
      token: token,
    };
  } catch (error) {
    log.error("Login error:", error.message);
    throw error;
  }
}

/**
 * Logout handler
 */
async function logout(event) {
  log.info("Logout request");

  try {
    if (currentSession) {
      log.info("Logging out user:", currentSession.username);
      currentSession = null;

    }

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    log.error("Logout error:", error.message);
    throw error;
  }
}

/**
 * Check authentication status
 */
async function checkAuth(event) {
  try {
    if (!currentSession) {
      return {
        success: false,
        authenticated: false,
        message: "No active session",
      };
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(currentSession.token, JWT_SECRET);

      return {
        success: true,
        authenticated: true,
        user: {
          id: currentSession.userId,
          username: currentSession.username,
          role: currentSession.role,
        },
      };
    } catch (jwtError) {
      log.warn("JWT verification failed:", jwtError.message);
      currentSession = null;

      return {
        success: false,
        authenticated: false,
        message: "Session expired",
      };
    }
  } catch (error) {
    log.error("Auth check error:", error.message);
    throw error;
  }
}

/**
 * Register new user handler
 */

/**
 * Get current session
 */
function getCurrentSession() {
  return currentSession;
}

/**
 * Validate session for other handlers
 */
function validateSession() {
  if (!currentSession) {
    throw new Error("Authentication required");
  }

  try {
    jwt.verify(currentSession.token, JWT_SECRET);
    return currentSession;
  } catch (error) {
    currentSession = null;
    throw new Error("Session expired");
  }
}

module.exports = { login, logout, checkAuth, getCurrentSession, validateSession };
