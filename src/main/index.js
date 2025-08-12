import { app, BrowserWindow, screen } from "electron";
import isDev from "electron-is-dev";
import updater from "electron-updater";
const { autoUpdater } = updater;
import { initDatabase } from "./database/connection.js";
import { setupIPC } from "./ipc/handlers/index.js";
import path from "path";
import { fileURLToPath } from "url";
import log from "electron-log";

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow;

// Configure logging
log.transports.file.level = "info";
log.info("App starting...");

// Create window function
function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: Math.min(1200, width * 0.8),
    height: Math.min(800, height * 0.8),
    minWidth: 800,
    minHeight: 600,
    center: true,
    show: false, // Don't show until ready-to-show
    icon: path.join(__dirname, "build/icons/icon.png"),
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      nodeIntegration: false, // Security: Disable Node.js integration
      contextIsolation: true, // Security: Enable context isolation
      enableRemoteModule: false, // Security: Disable remote module
      preload: path.join(__dirname, "security/preload.cjs"), // Load preload script
      webSecurity: !isDev, // Enable web security in production
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      sandbox: false, // We need access to Node.js APIs in preload
    },
  });

  // Load the app
  const startUrl = isDev? "http://localhost:3000":  
  `file://${path.join(__dirname, "../renderer/build/index.html")}`;
  console.log("Loading URL:", startUrl);

  mainWindow.loadURL(startUrl).catch((err) => {
    console.error("Failed to load URL:", err);
    log.error("Failed to load URL:", err);
  });

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    // Focus on window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
    log.info("Main window is ready and visible");
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    log.info("Main window closed");
  });

  // Handle window focus/blur for security
  mainWindow.on("focus", () => {
    log.debug("Main window focused");
  });

  mainWindow.on("blur", () => {
    log.debug("Main window blurred");
  });

  // Security: Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log.warn("Blocked attempt to open external URL:", url);
    return { action: "deny" };
  });

  // Handle navigation
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== startUrl) {
      event.preventDefault();
      log.warn("Blocked navigation to:", url);
    }
  });

  // Handle page title updates
  mainWindow.webContents.on("page-title-updated", (event, title) => {
    event.preventDefault();
    mainWindow.setTitle(`Casher Desktop - ${title}`);
  });

  // Handle unresponsive renderer
  mainWindow.webContents.on("unresponsive", () => {
    log.error("Renderer process became unresponsive");
  });

  mainWindow.webContents.on("responsive", () => {
    log.info("Renderer process became responsive again");
  });

  // Handle crashes
  mainWindow.webContents.on("crashed", (event, killed) => {
    log.error("Renderer process crashed:", { killed });
  });

  return mainWindow;
}

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
    console.log(parsedUrl.origin);
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
    log.error("Error during app initialization:", error);
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
  log.info("SIGTERM received, shutting down gracefully");
  app.quit();
});

process.on("SIGINT", () => {
  console.info("SIGINT received, shutting down gracefully");
  log.info("SIGINT received, shutting down gracefully");
  app.quit();
});

// Export for testing
export { app, mainWindow };
