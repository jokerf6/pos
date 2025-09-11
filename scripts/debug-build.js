import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Create debug directory
const debugDir = path.join(rootDir, "debug");
if (!fs.existsSync(debugDir)) {
  fs.mkdirSync(debugDir, { recursive: true });
}

// Log file
const logFile = path.join(debugDir, "build-log.txt");
fs.writeFileSync(
  logFile,
  `Build debug started at ${new Date().toISOString()}\n`,
  "utf8"
);

function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, `${message}\n`, "utf8");
}

// Step 1: Clean up
log("Step 1: Cleaning up previous builds...");
try {
  execSync('taskkill /f /im "Casher Desktop.exe" 2>nul', { stdio: "pipe" });
  log("Killed any running instances of the app");
} catch (err) {
  log("No running instances to kill (this is normal)");
}

try {
  fs.rmSync(path.join(rootDir, "dist"), { recursive: true, force: true });
  log("Removed dist directory");
} catch (err) {
  log("Error removing dist directory (may not exist): " + err.message);
}

// Step 2: Check main process file
log("\nStep 2: Validating main process file...");
const mainFilePath = path.join(rootDir, "src", "main", "index.js");
if (!fs.existsSync(mainFilePath)) {
  log(`ERROR: Main process file does not exist at ${mainFilePath}`);
  process.exit(1);
}

try {
  const mainContent = fs.readFileSync(mainFilePath, "utf8");
  log(`Main process file exists (${mainContent.length} bytes)`);

  // Analyze imports
  const imports = mainContent.match(/import.*?from\s+['"].+?['"];/g) || [];
  log(`Found ${imports.length} imports in main process file:`);
  imports.forEach((imp) => log(`  ${imp.trim()}`));
} catch (err) {
  log(`Error reading main process file: ${err.message}`);
}

// Step 3: Validate package.json
log("\nStep 3: Validating package.json...");
const packageJsonPath = path.join(rootDir, "package.json");
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  log("package.json is valid JSON");
  log(`Main entry point: ${packageJson.main}`);
  log(`Build configuration:`);
  log(`  productName: ${packageJson.build?.productName}`);
  log(`  asar: ${packageJson.build?.asar}`);
  log(`  target: ${JSON.stringify(packageJson.build?.win?.target)}`);
} catch (err) {
  log(`ERROR: Invalid package.json: ${err.message}`);
}

// Step 4: Build renderer
log("\nStep 4: Building renderer...");
try {
  execSync("npm run build:renderer", {
    stdio: [
      "pipe",
      fs.openSync(path.join(debugDir, "renderer-build.log"), "w"),
      fs.openSync(path.join(debugDir, "renderer-build-error.log"), "w"),
    ],
    cwd: rootDir,
  });
  log("Renderer build completed successfully");

  // Check if build output exists
  const rendererBuildDir = path.join(rootDir, "src", "renderer", "build");
  if (fs.existsSync(rendererBuildDir)) {
    const files = fs.readdirSync(rendererBuildDir);
    log(`Renderer build directory contains ${files.length} entries`);
    log(`Files: ${files.join(", ")}`);
  } else {
    log("ERROR: Renderer build directory does not exist");
  }
} catch (err) {
  log(`ERROR: Renderer build failed: ${err.message}`);
  log("See renderer-build-error.log for details");
}

// Step 5: Build with electron-builder
log("\nStep 5: Building with electron-builder...");
try {
  const command = "npx electron-builder --win --x64 --config.asar=false";
  log(`Running: ${command}`);

  execSync(command, {
    stdio: [
      "pipe",
      fs.openSync(path.join(debugDir, "electron-builder.log"), "w"),
      fs.openSync(path.join(debugDir, "electron-builder-error.log"), "w"),
    ],
    cwd: rootDir,
  });

  log("Electron builder completed successfully");

  // Check output
  const distDir = path.join(rootDir, "dist");
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    log(`Dist directory contains ${files.length} entries`);
    log(`Files: ${files.join(", ")}`);

    const unpacked = path.join(distDir, "win-unpacked");
    if (fs.existsSync(unpacked)) {
      const unpackedFiles = fs.readdirSync(unpacked);
      log(`Unpacked directory contains ${unpackedFiles.length} entries`);
      log(`Files: ${unpackedFiles.join(", ")}`);
    } else {
      log("ERROR: Unpacked directory does not exist");
    }
  } else {
    log("ERROR: Dist directory does not exist after build");
  }
} catch (err) {
  log(`ERROR: Electron build failed: ${err.message}`);
  log("See electron-builder-error.log for details");
}

// Step 6: Try to run the app
log("\nStep 6: Launching the app...");
const exePath = path.join(
  rootDir,
  "dist",
  "win-unpacked",
  "Casher Desktop.exe"
);
if (fs.existsSync(exePath)) {
  log(`Executable exists at: ${exePath}`);
  try {
    log("Attempting to start the app...");
    execSync(`start "" "${exePath}"`, { stdio: "inherit" });
    log("Launch command executed");
  } catch (err) {
    log(`ERROR: Failed to launch app: ${err.message}`);
  }
} else {
  log(`ERROR: Executable does not exist at: ${exePath}`);
}

log(
  "\nDebug process complete. Check the logs in the debug directory for more information."
);
