import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log("Cleaning dist directory...");
  try {
    execSync('taskkill /f /im "Casher Desktop.exe" 2>nul');
    console.log("Killed running app.");
  } catch {
    console.log("No running process found.");
  }

  try {
    fs.rmSync(path.resolve(__dirname, "../dist"), {
      recursive: true,
      force: true,
    });
    console.log("Dist directory cleaned.");
  } catch {
    console.log("No dist directory to remove.");
  }

  console.log("\nAnalyzing dependencies...");
  try {
    await import("./analyze-dependencies.js");
  } catch (err) {
    console.error("Dependency analysis failed:", err);
    process.exit(1);
  }

  console.log("\nBuilding the app...");
  try {
    const hasPnpmLock = fs.existsSync(
      path.resolve(__dirname, "../pnpm-lock.yaml")
    );
    const packageManager = hasPnpmLock ? "pnpm" : "npm";

    execSync(`${packageManager} run build:renderer`, { stdio: "inherit" });

    execSync(
      `${packageManager} exec electron-builder --win --x64 --publish=never`,
      { stdio: "inherit" }
    );

    console.log("\n✅ Build completed successfully!");
  } catch (err) {
    console.error("\n❌ Build failed:", err);
    process.exit(1);
  }
})();
