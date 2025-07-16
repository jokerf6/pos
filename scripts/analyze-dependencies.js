// analyze-dependencies.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Read all required modules from project files
console.log("Analyzing main process files for dependencies...");

function getRequiredModules() {
  const mainDir = path.join(rootDir, "src", "main");
  const requiredModules = new Set();

  function scanDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        scanDir(fullPath);
      } else if (
        file.name.endsWith(".js") ||
        file.name.endsWith(".cjs") ||
        file.name.endsWith(".mjs")
      ) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");

          // Find imports (ES modules)
          const importMatches =
            content.match(
              /import\s+.*?from\s+['"]([^'"@][^'"./][^'"]+)['"]/g
            ) || [];
          importMatches.forEach((match) => {
            const moduleName = match.match(
              /from\s+['"]([^'"@][^'"./][^'"]+)['"]/
            )[1];
            if (!moduleName.startsWith(".")) {
              requiredModules.add(moduleName);
            }
          });

          // Find requires (CommonJS)
          const requireMatches =
            content.match(
              /require\s*\(\s*['"]([^'"@][^'"./][^'"]+)['"]\s*\)/g
            ) || [];
          requireMatches.forEach((match) => {
            const moduleName = match.match(
              /require\s*\(\s*['"]([^'"@][^'"./][^'"]+)['"]\s*\)/
            )[1];
            if (!moduleName.startsWith(".")) {
              requiredModules.add(moduleName);
            }
          });
        } catch (err) {
          console.error(`Error reading file: ${fullPath}`, err);
        }
      }
    }
  }

  scanDir(mainDir);
  return [...requiredModules];
}

// Get list of required modules
const requiredModules = getRequiredModules();
console.log(
  `Found ${requiredModules.length} potential dependencies in main process code`
);

// Read package.json
const packageJsonPath = path.join(rootDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Check if required modules are in dependencies
const installedDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
]);

const missingDeps = requiredModules.filter((mod) => !installedDeps.has(mod));

// Install missing dependencies
if (missingDeps.length > 0) {
  console.log(
    `\nInstalling ${missingDeps.length} missing dependencies: ${missingDeps.join(", ")}`
  );

  try {
    // Choose npm or pnpm based on presence of pnpm-lock.yaml
    const hasPnpmLock = fs.existsSync(path.join(rootDir, "pnpm-lock.yaml"));
    const installCmd = hasPnpmLock ? "pnpm add" : "npm install";

    // Install each module one by one to avoid conflicts
    for (const mod of missingDeps) {
      console.log(`Installing ${mod}...`);
      execSync(`${installCmd} ${mod}`, { stdio: "inherit", cwd: rootDir });
    }

    console.log("All missing dependencies installed successfully.");
  } catch (err) {
    console.error("Error installing dependencies:", err);
  }
} else {
  console.log("All required dependencies are already installed.");
}

// Update build files configuration in package.json
const buildConfig = packageJson.build || {};
if (!buildConfig.files) {
  buildConfig.files = [];
}

// Make sure we include all node_modules
if (!buildConfig.files.includes("node_modules/**/*")) {
  buildConfig.files.push("node_modules/**/*");
  buildConfig.files.push("!node_modules/.cache/**/*");
  buildConfig.files.push("!node_modules/.bin/**/*");

  // Update package.json
  packageJson.build = buildConfig;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(
    "Updated package.json build configuration to include all node_modules."
  );
}

console.log("Dependency analysis complete.");
