import { ipcMain, IpcMainInvokeEvent } from "electron";
import log from "electron-log";

// Import individual handlers
import * as authHandlers from "./auth.js";
import * as usersH from "./users.js";
import * as categoriesH from "./categories.js";
import * as productsH from "./products.js"; // Import products handlers
import * as dailyH from "./daily.js"; // Import daily handlers
import * as creditH from "./credit.js"; // Import credit handlers
import * as invoiceH from "./invoice.js"; // Import credit handlers
import * as settingsHandlers from "./settings.js"; // Import settings handlers

// Type for IPC handler function
type IpcHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

// Error handling wrapper
const handleError = (handler: IpcHandler): IpcHandler => {
  return async (event: IpcMainInvokeEvent, ...args: any[]) => {
    try {
      return await handler(event, ...args);
    } catch (error: any) {
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
interface RateLimiter {
  count: number;
  resetTime: number;
}

const rateLimiter = new Map<number, RateLimiter>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX_CALLS = 100; // Max calls per window

const rateLimit = (handler: IpcHandler): IpcHandler => {
  return async (event: IpcMainInvokeEvent, ...args: any[]) => {
    const senderId = event.sender.id;
    const now = Date.now();

    if (!rateLimiter.has(senderId)) {
      rateLimiter.set(senderId, {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW,
      });
    }

    const limiter = rateLimiter.get(senderId)!;

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
const secureHandler = (handler: IpcHandler): IpcHandler => handleError(rateLimit(handler));

function setupIPC(): void {
  log.info("Setting up IPC handlers...");

  // Authentication handlers
  ipcMain.handle("auth:login", secureHandler(authHandlers.login));
  ipcMain.handle("auth:logout", secureHandler(authHandlers.logout));
  ipcMain.handle("auth:check", secureHandler(authHandlers.checkAuth));

  // TODO: Add other handlers when implemented
  // Users handlers
  ipcMain.handle("users:getAll", secureHandler(usersH.getAll));
  ipcMain.handle("users:getById", secureHandler(usersH.findById));
  ipcMain.handle("users:create", secureHandler(usersH.createUser));
  ipcMain.handle("users:update", secureHandler(usersH.update));
  ipcMain.handle("users:delete", secureHandler(usersH.deleteUser));
  ipcMain.handle("users:search", secureHandler(usersH.search));

  // Settings handlers
  ipcMain.handle("settings:getAll", secureHandler(settingsHandlers.getAll));
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

  // Settings handlers
  // ipcMain.handle('settings:get', secureHandler(settingsHandlers.get));
  // ipcMain.handle('settings:update', secureHandler(settingsHandlers.update));

  // System handlers
  // ipcMain.handle('system:getVersion', secureHandler(systemHandlers.getVersion));
  // ipcMain.handle('system:restart', secureHandler(systemHandlers.restart));
  // ipcMain.handle('system:minimize', secureHandler(systemHandlers.minimize));
  // ipcMain.handle('system:maximize', secureHandler(systemHandlers.maximize));
  // ipcMain.handle('system:close', secureHandler(systemHandlers.close));

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
function cleanupIPC(): void {
  log.info("Cleaning up IPC handlers...");
  ipcMain.removeAllListeners();
  rateLimiter.clear();
}

export { setupIPC, cleanupIPC };

