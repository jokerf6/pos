import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import Store from "electron-store";
import { IpcMainInvokeEvent } from "electron";

// JWT secret - in production, this should be loaded from environment variables
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = "24h";

// Types
interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}

interface Session {
  userId: number;
  username: string;
  role: string;
  token: string;
  loginTime: Date;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    username: string;
    role: string;
  };
  token: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

interface AuthCheckResponse {
  success: boolean;
  authenticated: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// Current session storage
let currentSession: Session | null = null;

/**
 * Login handler
 */
async function login(event: IpcMainInvokeEvent, credentials: LoginCredentials): Promise<LoginResponse> {
  log.info("Login attempt for user:", credentials.username);

  const { username, password } = credentials;

  // Validate input
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  try {
    const db = getDatabase();

    // Find user in database
    const [users] = await db.execute(
      "SELECT id, username, password_hash, role, created_at FROM users WHERE username = ? AND active = 1",
      [username]
    ) as [User[], any];

    if (users.length === 0) {
      log.warn("Login failed: User not found:", username);
      throw new Error("Invalid username or password");
    }

    const user = users[0];

    const store = new Store();
    store.set("user.id", user.id);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      log.warn("Login failed: Invalid password for user:", username);
      throw new Error("Invalid username or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Store session
    currentSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      token: token,
      loginTime: new Date(),
    };

    // Update last login time
    await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    log.info("Login successful for user:", username);

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token: token,
    };
  } catch (error: any) {
    log.error("Login error:", error.message);
    throw error;
  }
}

/**
 * Logout handler
 */
async function logout(event: IpcMainInvokeEvent): Promise<LogoutResponse> {
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
  } catch (error: any) {
    log.error("Logout error:", error.message);
    throw error;
  }
}

/**
 * Check authentication status
 */
async function checkAuth(event: IpcMainInvokeEvent): Promise<AuthCheckResponse> {
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
    } catch (jwtError: any) {
      log.warn("JWT verification failed:", jwtError.message);
      currentSession = null;

      return {
        success: false,
        authenticated: false,
        message: "Session expired",
      };
    }
  } catch (error: any) {
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
function getCurrentSession(): Session | null {
  return currentSession;
}

/**
 * Validate session for other handlers
 */
function validateSession(): Session {
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

export { login, logout, checkAuth, getCurrentSession, validateSession };
