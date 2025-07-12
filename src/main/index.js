import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import updater from "electron-updater";
const { autoUpdater } = updater;

import { initDatabase } from "./database/connection.js";
import { setupIPC } from "./ipc/handlers/index.js";
import { createWindow } from "./window/createWindow.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Configure logging

// Enable live reload for Electron in development
if (isDev) {
  // const electronReload = await import("electron-reload");
  // electronReload.default(__dirname, {
  //   electron: join(__dirname, "..", "..", "node_modules", ".bin", "electron"),
  //   hardResetMethod: "exit",
  // });
}

// Keep a global reference of the window object
let mainWindow;

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    console.warn("Blocked new window creation:", navigationUrl);
  });
});

// Security: Prevent navigation to external URLs
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== "http://localhost:3000" &&
      parsedUrl.origin !== "file://"
    ) {
      event.preventDefault();
      console.warn("Blocked navigation to:", navigationUrl);
    }
  });
});

// App event handlers
app.whenReady().then(async () => {
  try {
    // Initialize database
    await initDatabase();
    console.info("Database initialized successfully");

    // Create main window
    mainWindow = createWindow();
    console.info("Main window created");

    // Setup IPC handlers
    setupIPC();
    console.info("IPC handlers setup complete");

    // Setup auto updater in production
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        console.warn("Auto update check failed:", err.message);
      });
    }
  } catch (error) {
    console.error("Error during app initialization:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});

// Security: Prevent protocol handler hijacking
app.on("web-contents-created", (event, contents) => {
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
  });
});

// Handle certificate errors
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
      // In development, ignore certificate errors
      event.preventDefault();
      callback(true);
    } else {
      // In production, use default behavior
      callback(false);
    }
  }
);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM received, shutting down gracefully");
  app.quit();
});

process.on("SIGINT", () => {
  console.info("SIGINT received, shutting down gracefully");
  app.quit();
});

// Export for testing
export { app, mainWindow };
