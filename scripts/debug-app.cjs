const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const os = require("os");

console.log("Starting advanced app debugging...");

// Create debug directory if it doesn't exist
const debugDir = path.join(__dirname, "..", "debug");
if (!fs.existsSync(debugDir)) {
  fs.mkdirSync(debugDir, { recursive: true });
}

// Log file paths
const logFile = path.join(debugDir, "app-debug.log");
const errorLogFile = path.join(debugDir, "app-error.log");

// Write initial log entries
fs.writeFileSync(
  logFile,
  `Debug session started at ${new Date().toISOString()}\n`,
  "utf8"
);
fs.writeFileSync(
  errorLogFile,
  `Error log started at ${new Date().toISOString()}\n`,
  "utf8"
);

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`, "utf8");
}

function logError(message) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
  fs.appendFileSync(errorLogFile, `[${timestamp}] ${message}\n`, "utf8");
}

// Check system info
log(`OS: ${os.platform()} ${os.release()} ${os.arch()}`);
log(`Node version: ${process.version}`);

// Locate the executable
const exePath = path.join(
  __dirname,
  "..",
  "dist",
  "win-unpacked",
  "Casher Desktop.exe"
);
log(`Looking for executable at: ${exePath}`);

if (!fs.existsSync(exePath)) {
  logError(`Executable not found at: ${exePath}`);
  log("Checking if build output exists at all...");

  const distDir = path.join(__dirname, "..", "dist");
  if (fs.existsSync(distDir)) {
    log(`Dist directory exists. Contents:`);
    const distContents = fs.readdirSync(distDir);
    distContents.forEach((item) => log(`- ${item}`));

    if (distContents.includes("win-unpacked")) {
      const unpacked = path.join(distDir, "win-unpacked");
      log(`win-unpacked directory exists. Contents:`);
      const unpackedContents = fs.readdirSync(unpacked);
      unpackedContents.forEach((item) => log(`- ${item}`));
    }
  } else {
    logError("Dist directory does not exist. Build may have failed.");
    log("Attempting to build the app first...");
    try {
      execSync("npm run build:win", { stdio: "inherit" });
      log("Build complete. Checking for executable again...");
      if (fs.existsSync(exePath)) {
        log(`Executable now exists at: ${exePath}`);
      } else {
        logError(
          "Still cannot find executable after build. Something is wrong with the build process."
        );
        process.exit(1);
      }
    } catch (err) {
      logError(`Build failed: ${err.message}`);
      process.exit(1);
    }
  }
  process.exit(1);
}

// Executable exists, check resources and dependencies
log(`Found executable at: ${exePath}`);

const resourcesDir = path.join(
  __dirname,
  "..",
  "dist",
  "win-unpacked",
  "resources"
);
if (fs.existsSync(resourcesDir)) {
  log(`Resources directory exists.`);
  const appDir = path.join(resourcesDir, "app");

  if (fs.existsSync(appDir)) {
    log(`App directory exists. Contents:`);
    const appContents = fs.readdirSync(appDir);
    appContents.slice(0, 10).forEach((item) => log(`- ${item}`));

    // Check if package.json exists in the app directory
    const packageJsonPath = path.join(appDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        log(`Found package.json with main: ${packageJson.main}`);

        // Check if the main file exists
        const mainFilePath = path.join(appDir, packageJson.main);
        if (fs.existsSync(mainFilePath)) {
          log(`Main file exists at: ${mainFilePath}`);
        } else {
          logError(`Main file does not exist at: ${mainFilePath}`);
        }
      } catch (err) {
        logError(`Error parsing package.json: ${err.message}`);
      }
    } else {
      logError(`package.json not found in app directory`);
    }

    // Check if node_modules exists
    const nodeModulesPath = path.join(appDir, "node_modules");
    if (fs.existsSync(nodeModulesPath)) {
      log(`node_modules directory exists.`);
      const nodeModulesContents = fs.readdirSync(nodeModulesPath).slice(0, 20);
      log(`First 20 node_modules: ${nodeModulesContents.join(", ")}`);

      // Check specific important modules
      const criticalModules = [
        "electron-is-dev",
        "electron-updater",
        "mysql2",
        "fs-extra",
        "jsonwebtoken",
      ];
      criticalModules.forEach((mod) => {
        const modPath = path.join(nodeModulesPath, mod);
        if (fs.existsSync(modPath)) {
          log(`✓ Module ${mod} exists`);
        } else {
          logError(`✗ Module ${mod} is missing!`);
        }
      });
    } else {
      logError(`node_modules directory not found in app directory`);
    }
  } else {
    logError(`App directory does not exist in resources`);
  }
} else {
  logError(`Resources directory does not exist`);
}

// Try to run the app with process monitoring
log("Attempting to launch the app with debugging...");
log(`Command: "${exePath}" --enable-logging --v=1`);

try {
  // Launch the app as a detached process
  const child = spawn(exePath, ["--enable-logging", "--v=1"], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: false,
  });

  // Listen for stdout and stderr
  child.stdout.on("data", (data) => {
    const output = data.toString();
    log(`App output: ${output}`);
  });

  child.stderr.on("data", (data) => {
    const output = data.toString();
    logError(`App error: ${output}`);
  });

  child.on("exit", (code) => {
    if (code === 0) {
      log(`App exited successfully with code ${code}`);
    } else {
      logError(`App exited with code ${code}`);
    }
  });

  child.on("error", (err) => {
    logError(`Failed to start app: ${err.message}`);
  });

  // Unref the child to prevent it from keeping the Node.js process alive
  child.unref();

  log("App launched. Monitoring for startup issues...");

  // Check for app logs
  setTimeout(() => {
    const userDataDir = path.join(
      os.homedir(),
      "AppData",
      "Roaming",
      "Casher Desktop"
    );
    log(`Checking for app logs in user data directory: ${userDataDir}`);

    if (fs.existsSync(userDataDir)) {
      const logsDir = path.join(userDataDir, "logs");
      if (fs.existsSync(logsDir)) {
        log("Found logs directory. Contents:");
        const logFiles = fs.readdirSync(logsDir);
        logFiles.forEach((file) => {
          log(`- ${file}`);
          const logFilePath = path.join(logsDir, file);
          try {
            const lastLines = fs
              .readFileSync(logFilePath, "utf8")
              .split("\n")
              .slice(-20)
              .join("\n");
            log(`Last 20 lines of ${file}:\n${lastLines}`);
          } catch (err) {
            logError(`Error reading log file ${file}: ${err.message}`);
          }
        });
      } else {
        log("No logs directory found in user data directory");
      }
    } else {
      log("User data directory not found");
    }

    log("Debug session complete. Check the logs for details.");
  }, 5000);
} catch (err) {
  logError(`Error launching app: ${err.message}\n${err.stack}`);
}
