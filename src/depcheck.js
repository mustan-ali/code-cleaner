const depcheck = require("depcheck");
const path = require("path");

// Build tools and type definitions that are used but not directly imported
const BUILD_TOOL_DEPENDENCIES = [
    "typescript",
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "@babel/preset-react",
    "@babel/preset-env",
    "@babel/preset-typescript",
    "eslint",
    "prettier",
    "webpack",
    "vite",
    "rollup",
    "parcel",
    "jest",
    "mocha",
    "chai",
    "vitest"
];

module.exports = {
    checkUnusedDependencies(filePath) {
        const dir = path.dirname(filePath);

        return new Promise((resolve) => {
            depcheck(
                dir,
                {
                    ignoreBinPackage: false,
                    // Ignore common build tools and type definitions
                    ignorePatterns: [
                        "dist",
                        "build",
                        "coverage"
                    ]
                },
                unused => {
                    // Filter out build tools from unused dependencies
                    const unusedDeps = (unused.dependencies || [])
                        .filter(dep => !BUILD_TOOL_DEPENDENCIES.includes(dep));

                    const unusedDevDeps = (unused.devDependencies || [])
                        .filter(dep => !BUILD_TOOL_DEPENDENCIES.includes(dep));

                    resolve({
                        unusedDeps,
                        unusedDevDeps
                    });
                }
            );
        });
    }
};
