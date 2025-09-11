const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Clean dist directory
console.log("Cleaning dist directory...");
try {
  execSync('taskkill /f /im "Casher Desktop.exe" 2>nul');
} catch (e) {
  // Process might not exist, that's fine
}

try {
  fs.rmSync(path.resolve(__dirname, "../dist"), {
    recursive: true,
    force: true,
  });
} catch (e) {
  // Directory might not exist, that's fine
}

// Run the dependency analyzer
console.log("\nAnalyzing dependencies...");
try {
  require("./analyze-dependencies.cjs");
} catch (e) {
  console.log("Could not load dependency analyzer:", e.message);
}

// Build the app with specific flags
console.log("\nBuilding the app...");
try {
  execSync("npm run build:renderer", { stdio: "inherit" });
  execSync("npx electron-builder --win --x64 --config.asar=false", {
    stdio: "inherit",
  });
  console.log("\nBuild completed successfully!");

  // Check if the executable exists
  const exePath = path.join(
    __dirname,
    "..",
    "dist",
    "win-unpacked",
    "Casher Desktop.exe"
  );
  if (fs.existsSync(exePath)) {
    console.log(`\nExecutable found at: ${exePath}`);
    console.log("Attempting to launch...");

    try {
      execSync(`start "" "${exePath}"`, { stdio: "inherit" });
      console.log("App launched successfully!");
    } catch (err) {
      console.error("Failed to launch app:", err.message);
    }
  } else {
    console.error(`\nExecutable not found at: ${exePath}`);
    console.log("Build may have failed or used a different output path.");
  }
} catch (err) {
  console.error("\nBuild failed:", err);
}
