import { BrowserWindow, screen } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
import log from "electron-log";
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    icon: join(__dirname, "../../../build/icons/icon.png"),
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      nodeIntegration: false, // Security: Disable Node.js integration
      contextIsolation: true, // Security: Enable context isolation
      enableRemoteModule: false, // Security: Disable remote module
      preload: join(__dirname, "../security/preload.cjs"), // Load preload script
      webSecurity: !isDev, // Enable web security in production
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      sandbox: false, // We need access to Node.js APIs in preload
    },
  });

  // Load the app
  // const startUrl = isDev
  //   ? "http://localhost:3000"
  //   : `file://${join(__dirname, "../../renderer/build/index.html")}`;

  // console.log(path.join(__dirname, "../../../build/renderer/index.html"));
  mainWindow.loadURL(
    `file://${path.join(__dirname, "../../renderer/build/index.html")}`
  );

  // mainWindow.loadURL(startUrl);

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

export { createWindow };
