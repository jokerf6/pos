const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Cleanup function
function cleanup() {
  console.log("Cleaning up previous builds...");

  // Kill any running instances
  try {
    execSync('taskkill /f /im "Casher Desktop.exe" 2>nul');
    console.log("Killed running app instances");
  } catch (e) {
    // This is fine if no processes were running
  }

  // Remove dist directory
  try {
    fs.rmSync(path.join(__dirname, "../dist"), {
      recursive: true,
      force: true,
    });
    console.log("Removed dist directory");
  } catch (e) {
    // This is fine if the directory doesn't exist
  }
}

// Main build function
function buildApp() {
  console.log("Building Windows app with optimized settings...");

  // Clean up first
  cleanup();

  // Build renderer
  console.log("\n1. Building renderer...");
  execSync("npm run build:renderer", { stdio: "inherit" });
  console.log("Renderer build complete!");

  // Build with specific flags for optimal compatibility
  console.log("\n2. Building main app with electron-builder...");

  // Use these specific flags to maximize compatibility
  const buildFlags = [
    "--win",
    "--x64",
    "--config.asar=false",
    "--config.npmRebuild=true",
    "--config.files=src/main/**/*;src/renderer/build/**/*;package.json;node_modules/**/*",
  ];

  execSync(`npx electron-builder ${buildFlags.join(" ")}`, {
    stdio: "inherit",
  });
  console.log("Main app build complete!");

  // Check if the build was successful
  const exePath = path.join(
    __dirname,
    "../dist/win-unpacked/Casher Desktop.exe"
  );
  if (fs.existsSync(exePath)) {
    console.log(`\n✓ Build successful! Executable created at: ${exePath}`);

    // Launch the app
    console.log("\nLaunching app...");
    try {
      execSync(`start "" "${exePath}"`, { stdio: "inherit" });
      console.log("App launched successfully!");
    } catch (err) {
      console.error("Failed to launch app:", err.message);
    }
  } else {
    console.error(`\n✗ Build failed - executable not found at: ${exePath}`);
  }
}

// Execute the build
try {
  buildApp();
} catch (err) {
  console.error("Build failed with error:", err.message);
  process.exit(1);
}
