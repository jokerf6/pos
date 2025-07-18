const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the main process entry point
const mainPath = path.resolve(__dirname, '../src/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Find all imports and requires
const importRegex = /import\s+(?:(?:{[\s\w,]+}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;

const dependencies = new Set();

// Collect direct imports
let match;
while ((match = importRegex.exec(content))) {
  dependencies.add(match[1]);
}

while ((match = requireRegex.exec(content))) {
  dependencies.add(match[1]);
}

while ((match = dynamicImportRegex.exec(content))) {
  dependencies.add(match[1]);
}

// Read package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

// Create a list of all production dependencies
const allDeps = Object.keys(packageJson.dependencies || {});

// Filter to node_modules packages (not relative imports)
const nodeModuleDeps = Array.from(dependencies).filter(dep => 
  !dep.startsWith('./') && 
  !dep.startsWith('../') && 
  !dep.startsWith('/'));

console.log('Main process dependencies:');
nodeModuleDeps.forEach(dep => {
  console.log(` - ${dep}`);
});

// Resolve the package names (strip any path components)
const packageNames = nodeModuleDeps.map(dep => {
  // Handle scoped packages like @username/package
  if (dep.startsWith('@')) {
    return dep.split('/').slice(0, 2).join('/');
  }
  // Handle normal packages, possibly with paths like 'lodash/pick'
  return dep.split('/')[0];
});

// Check if these packages are in package.json
const missingPackages = packageNames.filter(pkg => !allDeps.includes(pkg));

if (missingPackages.length > 0) {
  console.log('\nMissing dependencies:');
  missingPackages.forEach(pkg => {
    console.log(` - ${pkg}`);
  });
  
  // Option to install missing packages
  console.log('\nInstalling missing dependencies...');
  try {
    execSync(`npm install --save ${missingPackages.join(' ')}`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to install packages:', err);
  }
} else {
  console.log('\nAll dependencies are already in package.json');
}

// Update the electron-builder configuration
console.log('\nUpdating electron-builder configuration...');
packageJson.build = packageJson.build || {};
packageJson.build.asar = false;
packageJson.build.files = [
  "src/main/**/*",
  "src/renderer/build/**/*",
  "src/shared/**/*",
  "package.json",
  "node_modules/**/*"
];

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Updated package.json with optimized build configuration.');
