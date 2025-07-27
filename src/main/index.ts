import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import updater from "electron-updater";
const { autoUpdater } = updater;

import { initDatabase } from "./database/connection.js";
import { setupIPC } from "./ipc/handlers/index.js";
import { createWindow } from "./window/createWindow.js";

// Configure logging for better error visibility
console.log("Starting Casher Desktop application");
console.log("Node version:", process.versions.node);
console.log("Electron version:", process.versions.electron);
console.log("Chrome version:", process.versions.chrome);
console.log("Is development mode:", isDev);

// Enable live reload for Electron in development
if (isDev) {
  // const electronReload = await import("electron-reload");
  // electronReload.default(__dirname, {
  //   electron: join(__dirname, "..", "..", "node_modules", ".bin", "electron"),
  //   hardResetMethod: "exit",
  // });
}

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  // Block new window creation
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    console.warn("Blocked new window creation:", navigationUrl);
  });

  // Block navigation to unknown protocols
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    console.log("🔍 Attempted navigation to:", navigationUrl);

    if (
      parsedUrl.protocol !== "file:" &&
      parsedUrl.origin !== "http://localhost:3000"
    ) {
      event.preventDefault();
      console.warn("🚫 Blocked navigation to:", navigationUrl);
    }
  });

  // Strip unsafe preload and disable Node integration in webviews
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    delete webPreferences.preload;
    delete webPreferences.preloadURL;
    webPreferences.nodeIntegration = false;
  });
});
// Security: Prevent navigation to external URLs

// Global error handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// App event handlers
app.whenReady().then(async () => {
  try {
    console.log("App is ready, initializing...");

    // Initialize database
    console.log("Initializing database...");
    await initDatabase();
    console.info("Database initialized successfully");

    // Create main window
    console.log("Creating main window...");
    mainWindow = createWindow();
    console.info("Main window created");

    // Add error handler to window
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.on(
        "did-fail-load",
        (event, errorCode, errorDescription) => {
          console.error(`Failed to load: ${errorDescription} (${errorCode})`);
        }
      );
    }

    // Setup IPC handlers
    console.log("Setting up IPC handlers...");
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

