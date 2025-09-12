const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const log = require('electron-log');
const path = require('path');
let database = null;
const { app } = require('electron');
const fs = require('fs');

const schemaSQL = `
-- Table structure for table 'categories'
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
    deleted_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Table structure for table 'users'
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','manager','cashier')) DEFAULT 'cashier',
  active INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  last_login TIMESTAMP

);



CREATE TABLE IF NOT EXISTS daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE DEFAULT (date('now')),
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER NOT NULL,
  closed_at DATETIME,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  openPrice INTEGER,
  closePrice INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table structure for table 'credit'
CREATE TABLE IF NOT EXISTS credit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reason TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  reciever TEXT,
  daily_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (daily_id) REFERENCES daily(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

-- Table structure for table 'items'
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  barcode TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  quantity INTEGER,
  buy_price REAL,
  category_id INTEGER,
  unitId INTEGER,
  deleted_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (unitId) REFERENCES units(id)
  );

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerName TEXT,
  customerPhone TEXT,
  paymentType TEXT CHECK(paymentType IN ('خالص','أجل','مرتجع')) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  totalAfterDiscount DECIMAL(10,2) NOT NULL,
  dailyId INTEGER,
  userId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dailyId) REFERENCES daily(id) ON DELETE SET NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Table structure for table 'invoiceItems'
CREATE TABLE IF NOT EXISTS invoiceItems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoiceId INTEGER NOT NULL,
  itemId INTEGER NOT NULL,
  pricePerUnit DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  discount DECIMAL(10,2) DEFAULT 0.00,
  price DECIMAL(10,2) NOT NULL,
  totalPriceAfterDiscount DECIMAL(10,2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
);

-- Table structure for table 'permissions'
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table 'settings'
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  name TEXT,
  type TEXT CHECK(type IN ('string','number','boolean'))
);

-- Table structure for table 'transactions'
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  transaction_type TEXT CHECK(transaction_type IN ('purchase','return','sale')) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) AS (quantity * unit_price),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)

);

-- Table structure for table 'user_permissions'
CREATE TABLE IF NOT EXISTS user_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  granted_by INTEGER,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (user_id, permission_id)
);

-- Insert initial data for users
INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at, last_login) VALUES
(1, 'admin', '$2a$12$OKIaDMekpEnHqqEgu2lB9efGPWsLeYYtOjifZlUeTngvg9yN6G/VW', 'admin', 1, '2025-07-07 13:11:52', '2025-08-13 17:08:38', '2025-08-13 17:08:38');

-- Insert initial data for permissions
INSERT INTO permissions (id, name, display_name, description, category, created_at, updated_at) VALUES
(1, 'sales.create', 'إنشاء مبيعات', 'إمكانية إنشاء فواتير مبيعات جديدة', 'sales', '2025-08-06 14:22:02', '2025-08-06 20:47:10'),
(2, 'sales.view', 'عرض المبيعات', 'إمكانية عرض فواتير المبيعات', 'sales', '2025-08-06 14:22:02', '2025-08-06 20:47:15'),
(6, 'inventory.view', 'عرض المخزون', 'إمكانية عرض المنتجات والمخزون', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:29'),
(7, 'inventory.create', 'إضافة منتجات', 'إمكانية إضافة منتجات جديدة', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:33'),
(8, 'inventory.edit', 'تعديل المنتجات', 'إمكانية تعديل بيانات المنتجات', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:35'),
(9, 'inventory.delete', 'حذف المنتجات', 'إمكانية حذف المنتجات', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:38'),
(15, 'users.view', 'عرض المستخدمين', 'إمكانية عرض قائمة المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:42'),
(16, 'users.create', 'إضافة مستخدمين', 'إمكانية إضافة مستخدمين جدد', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:49'),
(17, 'users.edit', 'تعديل المستخدمين', 'إمكانية تعديل بيانات المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:50'),
(18, 'users.delete', 'حذف المستخدمين', 'إمكانية حذف المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:52'),
(19, 'users.permissions', 'إدارة الصلاحيات', 'إمكانية تعديل صلاحيات المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:54'),
(23, 'cashier.open', 'فتح الكاشير', 'إمكانية فتح جلسة الكاشير', 'system', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(24, 'cashier.close', 'إغلاق الكاشير', 'إمكانية إغلاق جلسة الكاشير', 'system', '2025-08-06 14:22:02', '2025-08-06 20:48:04'),
(26, 'category.view', 'عرض الاقسام', 'إمكانية عرض كل الاقسام', 'category', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(27, 'category.create', 'إضافة قسم', 'إمكانية إضافة قسم الي الاقسام', 'category', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(28, 'category.delete', 'حذف قسم', 'إمكانية حذق قسم من الاقسام', 'category', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(30, 'credit.view', 'عرض المصروفات', 'إمكانية عرض كل المصروفات', 'credit', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(31, 'credit.create', 'عمل مصروف', 'إمكانية عمل مصروف', 'credit', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(32, 'credit.delete', 'حذف مصروف', 'إمكانية حذف مصروف من المصروفات', 'credit', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(33, 'settings.view', 'عرض الاعدادات', 'إمكانيه عرض الاعدادات والتعديل عليها', 'settings', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(34, 'transaction.view', 'عرض الاحصائيات', 'إمكانيه عرض الاحصائيات', 'transaction', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(41, 'units.view', 'عرض الوحدات', 'إمكانية عرض الوحدات', 'units', '2025-08-06 14:22:02', '2025-08-06 20:47:38'),
(42, 'units.create', 'إضافة وحدة', 'إمكانية إضافة وحدة جديدة', 'units', '2025-08-06 14:22:02', '2025-08-06 20:47:38'),
(43, 'units.edit', 'تعديل الوحدات', 'إمكانية تعديل الوحدات', 'units', '2025-08-06 14:22:02', '2025-08-06 20:47:38'),
(44, 'units.delete', 'حذف الوحدات', 'إمكانية حذف الوحدات', 'units', '2025-08-06 14:22:02', '2025-08-06 20:47:38');


INSERT INTO units (id, is_default, name, created_at) VALUES
(1, 1, 'قطعة', '2025-08-06 14:22:02');

-- Insert initial data for settings
INSERT INTO settings (id, domain, key, value, name, type) VALUES
(1, 'products', 'warning', '3', 'تحذير بنفاذ الكمية بعد', 'number'),
(2, 'daily', 'open', 'true', 'فتح اليومية بمبلغ مالي', 'boolean'),
(3, 'daily', 'closeWithSchudledInvoice', 'false', 'غلف اليومية بوجود فواتير أجل', 'boolean'),
(4, 'backup', 'backupPath', '/src/main/database/backup', 'مسار النسخ الاحتياطي لقاعدة البيانات', 'string'),
(5, 'general', 'companyName', '', 'اسم الشركه', 'string'),
(6, 'general', 'companyPhone', '', 'هاتف الشركة', 'string'),
(7, 'general', 'companyAddress', '', 'عنوان الشركة', 'string'),
(8, 'general', 'invoicePrinter', '', 'اسم طابعه الفواتير', 'string');

-- Insert initial data for user_permissions
INSERT INTO user_permissions (id, user_id, permission_id, granted_by, granted_at) VALUES

(1, 1, 1, 1, '2025-08-13 17:08:31'),
(2, 1, 2, 1, '2025-08-13 17:08:31'),
(3, 1, 6, 1, '2025-08-13 17:08:31'),
(4, 1, 7, 1, '2025-08-13 17:08:31'),
(5, 1, 8, 1, '2025-08-13 17:08:31'),
(6, 1, 9, 1, '2025-08-13 17:08:31'),
(7, 1, 15, 1, '2025-08-13 17:08:31'),
(8, 1, 16, 1, '2025-08-13 17:08:31'),
(9, 1, 17, 1, '2025-08-13 17:08:31'),
(10, 1, 18, 1, '2025-08-13 17:08:31'),
(11, 1, 19, 1, '2025-08-13 17:08:31'),
(12, 1, 23, 1, '2025-08-13 17:08:31'),
(13, 1, 24, 1, '2025-08-13 17:08:31'),
(14, 1, 26, 1, '2025-08-13 17:08:31'),
(15, 1, 27, 1, '2025-08-13 17:08:31'),
(16, 1, 28, 1, '2025-08-13 17:08:31'),
(17, 1, 30, 1, '2025-08-13 17:08:31'),
(18, 1, 31, 1, '2025-08-13 17:08:31'),
(19, 1, 32, 1, '2025-08-13 17:08:31'),
(20, 1, 33, 1, '2025-08-13 17:08:31'),
(21, 1, 34, 1, '2025-08-13 17:08:31'),
(22, 1, 41, 1, '2025-08-13 17:08:31'),
(23, 1, 42, 1, '2025-08-13 17:08:31'),
(24, 1, 43, 1, '2025-08-13 17:08:31'),
(25, 1, 44, 1, '2025-08-13 17:08:31');




-- Update sequences
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM categories) WHERE name = 'categories';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM credit) WHERE name = 'credit';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM daily) WHERE name = 'daily';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM items) WHERE name = 'items';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM invoices) WHERE name = 'invoices';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM invoiceItems) WHERE name = 'invoiceItems';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM permissions) WHERE name = 'permissions';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM settings) WHERE name = 'settings';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM transactions) WHERE name = 'transactions';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM units) WHERE name = 'units';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM user_permissions) WHERE name = 'user_permissions';
`;

async function initDatabase() {
  try {
    const dbPath = path.join(app.getPath('userData'), 'casher.db');
    log.info(`Database path: ${dbPath}`);

    // افتح الاتصال مع تفعيل التصحيح
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      verbose: true
    });

    // تفعيل المفاتيح الخارجية
    await database.exec('PRAGMA foreign_keys = ON');

    // التحقق مما إذا كانت الجداول موجودة بالفعل
    const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table'");
    
    if (tables.length === 0) {
      // الجداول غير موجودة، قم بإنشائها
      log.info("Creating database schema for the first time...");
      await createSchema();
      // await insertInitialData();
    } else {
      log.info("Database already initialized, skipping schema creation");
    }


    return database;
  } catch (error) {
    log.error("Database initialization failed:", {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
async function createSchema() {
 

    await database.exec(schemaSQL);
}


function getDatabase() {
  if (!database) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return database;
}

async function closeDatabase() {
  if (database) {
    await database.close();
    database = null;
    log.info("SQLite database connection closed");
  }
}

async function healthCheck() {
  try {
    await database.get(`SELECT 1`);
    return { status: "healthy", timestamp: new Date() };
  } catch (error) {
    log.error("Database health check failed:", error.message);
    return { status: "unhealthy", error: error.message, timestamp: new Date() };
  }
}

module.exports = { initDatabase, getDatabase, closeDatabase, healthCheck };