import mysql from "mysql2/promise";
import { dirname, join } from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import log from "electron-log";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let database = null;
let connectionPool = null;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "fahd",
  password: process.env.DB_PASSWORD || "fahd200",
  database: process.env.DB_NAME || "casher",
  charset: "utf8mb4",
  timezone: "+00:00",
};

/**
 * Initialize database connection
 */
async function initDatabase() {
  try {
    log.info("Initializing database connection...");

    // Create connection pool
    connectionPool = mysql.createPool(dbConfig);

    // Test connection
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();

    log.info("Database connection established successfully");

    // Run migrations
   // await runMigrations();

    // Set global database reference
    database = connectionPool;

    return database;
  } catch (error) {
    log.error("Database initialization failed:", error.message);

    

    throw error;
  }
}

/**
 * Create database if it doesn't exist
 */
async function createDatabase() {
  try {
    log.info("Creating database...");

    const tempConfig = { ...dbConfig };
    delete tempConfig.database;

    const tempConnection = await mysql.createConnection(tempConfig);

    await tempConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await tempConnection.end();

    log.info("Database created successfully");
  } catch (error) {
    log.error("Database creation failed:", error.message);
    throw error;
  }
}

/**
 * Run database migrations
 */
/*
async function runMigrations() {
  try {
    log.info("Running database migrations...");

    // Create migrations table if it doesn't exist
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const [executedMigrations] = await connectionPool.execute(
      "SELECT filename FROM migrations ORDER BY id"
    );

    const executedFiles = executedMigrations.map((row) => row.filename);

    // Read migration files
    const migrationsDir = join(__dirname, "migrations");

    try {
      const migrationFiles = await fs.readdir(migrationsDir);
      const sqlFiles = migrationFiles
        .filter((file) => file.endsWith(".sql"))
        .sort();

      // Execute pending migrations
      for (const file of sqlFiles) {
        if (!executedFiles.includes(file)) {
          await executeMigration(file);
        }
      }
    } catch (dirError) {
      if (dirError.code === "ENOENT") {
        log.warn("Migrations directory not found, creating initial schema...");
        await createInitialSchema();
      } else {
        throw dirError;
      }
    }

    log.info("Database migrations completed");
  } catch (error) {
    log.error("Migration failed:", error.message);
    throw error;
  }
}

/**
 * Execute a single migration file
 */
/*
async function executeMigration(filename) {
  try {
    log.info("Executing migration:", filename);

    const migrationPath = join(__dirname, "migrations", filename);
    const migrationSQL = await fs.readFile(migrationPath, "utf8");

    // Split SQL statements (simple approach)
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await connectionPool.execute(statement);
    }

    // Record migration as executed
    await connectionPool.execute(
      "INSERT INTO migrations (filename) VALUES (?)",
      [filename]
    );

    log.info("Migration executed successfully:", filename);
  } catch (error) {
    log.error("Migration execution failed:", filename, error.message);
    throw error;
  }
}

/**
 * Create initial database schema
 */
/*
async function createInitialSchema() {
  try {
    log.info("Creating initial database schema...");

    // Users table
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Products table
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        barcode VARCHAR(100) UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        cost DECIMAL(10, 2) DEFAULT 0,
        stock_quantity INT DEFAULT 0,
        min_stock_level INT DEFAULT 0,
        category VARCHAR(100),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_barcode (barcode),
        INDEX idx_category (category),
        INDEX idx_active (active)
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Transactions table
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        payment_method ENUM('cash', 'card', 'digital') DEFAULT 'cash',
        status ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_transaction_number (transaction_number),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Transaction items table
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Settings table
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key_name (key_name)
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Insert default admin user
    const bcrypt = await import("bcryptjs");
    const defaultPassword = await bcrypt.default.hash("admin123", 12);

    await connectionPool.execute(
      `
      INSERT IGNORE INTO users (username, password_hash, email, role) 
      VALUES ('admin', ?, 'admin@casher.local', 'admin')
    `,
      [defaultPassword]
    );

    // Insert default settings
    const defaultSettings = [
      ["store_name", "Casher Store", "Name of the store"],
      ["currency", "USD", "Default currency"],
      ["tax_rate", "0.10", "Default tax rate (10%)"],
      [
        "receipt_footer",
        "Thank you for your business!",
        "Footer text for receipts",
      ],
    ];

    for (const [key, value, description] of defaultSettings) {
      await connectionPool.execute(
        `
        INSERT IGNORE INTO settings (key_name, value, description) 
        VALUES (?, ?, ?)
      `,
        [key, value, description]
      );
    }

    log.info("Initial database schema created successfully");
  } catch (error) {
    log.error("Initial schema creation failed:", error.message);
    throw error;
  }
}


/**
 * Get database connection
 */
function getDatabase() {
  if (!database) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return database;
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (connectionPool) {
    await connectionPool.end();
    database = null;
    connectionPool = null;
    log.info("Database connection closed");
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    return { status: "healthy", timestamp: new Date() };
  } catch (error) {
    log.error("Database health check failed:", error.message);
    return { status: "unhealthy", error: error.message, timestamp: new Date() };
  }
}

export { initDatabase, getDatabase, closeDatabase, healthCheck };
