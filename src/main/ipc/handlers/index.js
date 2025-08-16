const { ipcMain } = require("electron");
const log = require("electron-log");

// Import individual handlers
const authHandlers = require("./auth.js");
const usersH = require("./users.js");
const permissionsH = require("./permissions.js");
const categoriesH = require("./categories.js");
const productsH = require("./products.js"); // Import products handlers
const dailyH = require("./daily.js"); // Import daily handlers
const creditH = require("./credit.js"); // Import credit handlers
const invoiceH = require("./invoice.js"); // Import credit handlers
const settingsHandlers = require("./settings.js"); // Import settings handlers
const transH = require("./transaction.js"); // Import transaction handlers
const reportsH = require ("./reports.js"); // Import reports handlers
const pdfExportH = require ("./pdf-export.js");
// Error handling wrapper
const handleError = (handler) => {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      log.error("IPC Handler Error:", {
        channel: event.frameId,
        error: error.message,
        stack: error.message,
      });

      // Return structured error response
      throw new Error(error.message);
    }
  };
};

// Rate limiting for IPC calls
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX_CALLS = 100; // Max calls per window

const rateLimit = (handler) => {
  return async (event, ...args) => {
    const senderId = event.sender.id;
    const now = Date.now();

    if (!rateLimiter.has(senderId)) {
      rateLimiter.set(senderId, {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW,
      });
    }

    const limiter = rateLimiter.get(senderId);

    if (now > limiter.resetTime) {
      limiter.count = 0;
      limiter.resetTime = now + RATE_LIMIT_WINDOW;
    }

    if (limiter.count >= RATE_LIMIT_MAX_CALLS) {
      log.warn("Rate limit exceeded for sender:", senderId);
      throw new Error("Rate limit exceeded");
    }

    limiter.count++;
    return await handler(event, ...args);
  };
};

// Combine error handling and rate limiting
const secureHandler = (handler) => handleError(rateLimit(handler));

function setupIPC() {
  log.info("Setting up IPC handlers...");

  // Authentication handlers
  ipcMain.handle("auth:login", secureHandler(authHandlers.login));
  ipcMain.handle("auth:logout", secureHandler(authHandlers.logout));
  ipcMain.handle("auth:check", secureHandler(authHandlers.checkAuth));

  // Users handlers
  ipcMain.handle("users:getAll", secureHandler(usersH.getAll));
  ipcMain.handle("users:getById", secureHandler(usersH.getById));
  ipcMain.handle("users:create", secureHandler(usersH.createUser));
  ipcMain.handle("users:update", secureHandler(usersH.update));
  ipcMain.handle("users:delete", secureHandler(usersH.deleteUser));
  ipcMain.handle("users:search", secureHandler(usersH.search));

  // Permissions handlers
  ipcMain.handle("permissions:getAll", secureHandler(permissionsH.getAllPermissions));
  ipcMain.handle("permissions:getByCategory", secureHandler(permissionsH.getPermissionsByCategory));
  ipcMain.handle("permissions:getUserPermissions", secureHandler(permissionsH.getUserPermissions));
  ipcMain.handle("permissions:updateUserPermissions", secureHandler(permissionsH.updateUserPermissions));
  ipcMain.handle("permissions:grant", secureHandler(permissionsH.grantPermission));
  ipcMain.handle("permissions:revoke", secureHandler(permissionsH.revokePermission));
  ipcMain.handle("permissions:hasPermission", secureHandler(permissionsH.hasPermission));

  // Settings handlers
  ipcMain.handle("settings:getAll", secureHandler(settingsHandlers.getAll));
  ipcMain.handle("settings:backupDatabase", secureHandler(settingsHandlers.backupDatabase));
  ipcMain.handle(
    "settings:getByDomain",
    secureHandler(settingsHandlers.getByDomain)
  );
  ipcMain.handle("settings:getByKey", secureHandler(settingsHandlers.getByKey));
  ipcMain.handle(
    "settings:update",
    secureHandler(settingsHandlers.updateSettings)
  );

  // Products handlers
  ipcMain.handle("products:getAll", secureHandler(productsH.getAll));
  ipcMain.handle("products:getById", secureHandler(productsH.findById));
  ipcMain.handle("products:create", secureHandler(productsH.createProduct));
  ipcMain.handle("products:update", secureHandler(productsH.update));
  ipcMain.handle("products:delete", secureHandler(productsH.deleteProduct));
  ipcMain.handle("products:search", secureHandler(productsH.search));
  ipcMain.handle(
    "products:generateBarCode",
    secureHandler(productsH.generateBarCode)
  );

  ipcMain.handle(
    "products:getByBarcode",
    secureHandler(productsH.getBybarcode)
  );

  // Categories handlers
  ipcMain.handle("categories:getAll", secureHandler(categoriesH.getAll));
  ipcMain.handle("categories:getById", secureHandler(categoriesH.findById));
  ipcMain.handle(
    "categories:create",
    secureHandler(categoriesH.createCategory)
  );
  ipcMain.handle("categories:update", secureHandler(categoriesH.update));
  ipcMain.handle(
    "categories:delete",
    secureHandler(categoriesH.deleteCategory)
  );
  ipcMain.handle("categories:search", secureHandler(categoriesH.search));

  // Daily handlers
  ipcMain.handle("daily:open", secureHandler(dailyH.openDaily));
  ipcMain.handle("daily:close", secureHandler(dailyH.closeDaily));
  ipcMain.handle("daily:get", secureHandler(dailyH.getDaily));

  // Credit handlers
  ipcMain.handle("credit:create", secureHandler(creditH.createCredit));
  ipcMain.handle("credit:getAll", secureHandler(creditH.getAllCredit));
  ipcMain.handle("credit:getByDaily", secureHandler(creditH.getCreditByDaily));
  ipcMain.handle("credit:delete", secureHandler(creditH.deleteCredit));

  // Invoice handlers
  ipcMain.handle("invoice:create", secureHandler(invoiceH.createInvoice));
  ipcMain.handle("invoice:after", secureHandler(invoiceH.afterInvoice));
  ipcMain.handle("invoice:before", secureHandler(invoiceH.beforeInvoice));
  ipcMain.handle("invoice:getAll", secureHandler(invoiceH.getAllInvoices));
  ipcMain.handle("invoice:update", secureHandler(invoiceH.updateInvoice));
  ipcMain.handle("invoice:print", secureHandler(invoiceH.PrintInvoice));

    // Transaction handlers
  ipcMain.handle("transactions:get-product-transactions", secureHandler(transH.getProductTransactions));


   // Reports handlers
  ipcMain.handle("reports:daily-sales", secureHandler(reportsH.getDailySalesReport));
  ipcMain.handle("reports:monthly-sales", secureHandler(reportsH.getMonthlySalesReport));
  ipcMain.handle("reports:product-performance", secureHandler(reportsH.getProductPerformanceReport));
  ipcMain.handle("reports:cashier-performance", secureHandler(reportsH.getCashierPerformanceReport));
  ipcMain.handle("reports:inventory", secureHandler(reportsH.getInventoryReport));
  ipcMain.handle("reports:financial-summary", secureHandler(reportsH.getFinancialSummaryReport));

  // PDF Export handlers
  ipcMain.handle("pdf:generate-report", secureHandler(pdfExportH.generatePDFReport));

  log.info("IPC handlers setup complete");

  // Cleanup rate limiter periodically
  setInterval(() => {
    const now = Date.now();
    for (const [senderId, limiter] of rateLimiter.entries()) {
      if (now > limiter.resetTime + RATE_LIMIT_WINDOW) {
        rateLimiter.delete(senderId);
      }
    }
  }, RATE_LIMIT_WINDOW * 2);
}

// Cleanup function
function cleanupIPC() {
  log.info("Cleaning up IPC handlers...");
  ipcMain.removeAllListeners();
  rateLimiter.clear();
}

module.exports = { setupIPC, cleanupIPC };
