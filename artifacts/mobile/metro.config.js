const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Monorepo root is two levels up from artifacts/mobile
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the monorepo root for changes
config.watchFolders = [monorepoRoot];

// 2. Tell Metro where to find node_modules in pnpm monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Ensure Metro can resolve from the project root
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
