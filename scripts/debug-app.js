import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a debug log file in the dist directory
const logFile = path.join(__dirname, "../dist/debug.log");

// Ensure the dist directory exists
if (!fs.existsSync(path.join(__dirname, "../dist"))) {
  fs.mkdirSync(path.join(__dirname, "../dist"), { recursive: true });
}

// Write a debug log entry
fs.writeFileSync(
  logFile,
  `Debug session started at ${new Date().toISOString()}\n`,
  "utf8"
);

// Try to run the app with debugging
console.log("Starting app with debug logging...");
try {
  const exePath = path.join(
    __dirname,
    "../dist/win-unpacked/Casher Desktop.exe"
  );

  // Check if the exe exists
  if (!fs.existsSync(exePath)) {
    console.error(`Error: Executable not found at: ${exePath}`);
    fs.appendFileSync(
      logFile,
      `Error: Executable not found at: ${exePath}\n`,
      "utf8"
    );
    process.exit(1);
  }

  // Log the existence of the main executable
  fs.appendFileSync(logFile, `Found executable at: ${exePath}\n`, "utf8");

  // Check if node_modules are properly included
  const nodeModulesPath = path.join(
    __dirname,
    "../dist/win-unpacked/node_modules"
  );
  if (fs.existsSync(nodeModulesPath)) {
    const nodeModulesList = fs.readdirSync(nodeModulesPath).slice(0, 10); // List first 10 modules
    fs.appendFileSync(
      logFile,
      `Found node_modules: ${nodeModulesList.join(", ")}...\n`,
      "utf8"
    );
  } else {
    fs.appendFileSync(
      logFile,
      "node_modules directory not found in the packaged app.\n",
      "utf8"
    );
  }

  // Try to run the app with debug logging
  console.log(`Launching ${exePath}`);
  fs.appendFileSync(logFile, `Launching ${exePath}\n`, "utf8");

  // Start the app with debug flags
  const command = `start "" "${exePath}" --enable-logging --v=1`;
  execSync(command, { stdio: "inherit" });

  console.log("App started. Check the application logs for details.");
  fs.appendFileSync(logFile, "App started via execSync command.\n", "utf8");
} catch (err) {
  console.error("Error launching app:", err);
  fs.appendFileSync(
    logFile,
    `Error launching app: ${err.message}\n${err.stack}\n`,
    "utf8"
  );
}
