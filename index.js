const core = require("@actions/core");
const depCheck = require("./src/depcheck");
const importCheck = require("./src/importcheck");
const utils = require("./src/utils");

// ANSI color codes for better terminal output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    blue: "\x1b[34m",
    gray: "\x1b[90m"
};

function formatHeader(text) {
    return `\n${text}\n${"-".repeat(text.length)}\n`;
}

function formatSection(text) {
    return text;
}

function formatFile(filePath) {
    // Show relative path for cleaner output
    const relativePath = filePath.replace(process.cwd(), ".").replace(/\\/g, "/");
    return relativePath;
}

function formatItem(text) {
    return `  - ${text}`;
}

async function run() {
    try {
        const projectRoot = process.cwd();

        // Header
        console.log(formatHeader("Code Cleaner - Analyzing Your Project"));

        // Step 1: Find package.json files
        core.info(formatSection("Scanning for package.json files..."));
        const packageFiles = utils.findPackageJsonFiles(projectRoot);

        if (packageFiles.length === 0) {
            console.log(`\nNo package.json files found. Nothing to analyze.\n`);
            return;
        }

        console.log(`Found ${packageFiles.length} package.json file(s)\n`);

        let hasUnusedImports = false;
        let hasUnusedDeps = false;
        let totalUnusedDeps = 0;
        let totalUnusedImports = 0;

        // Step 2: Check unused dependencies
        core.info(formatSection("Checking dependencies..."));
        for (const file of packageFiles) {
            const results = await depCheck.checkUnusedDependencies(file);

            if (results.unusedDeps.length > 0 || results.unusedDevDeps.length > 0) {
                hasUnusedDeps = true;
                const totalInFile = results.unusedDeps.length + results.unusedDevDeps.length;
                totalUnusedDeps += totalInFile;

                core.warning(`\nUnused dependencies in ${formatFile(file)}:`);

                if (results.unusedDeps.length > 0) {
                    results.unusedDeps.forEach(d => console.log(formatItem(d)));
                }
                if (results.unusedDevDeps.length > 0) {
                    results.unusedDevDeps.forEach(d => console.log(formatItem(`${d} (devDependency)`)));
                }
            }
        }

        if (!hasUnusedDeps) {
            console.log(`All dependencies are being used\n`);
        } else {
            console.log("");
        }

        // Step 3: Check unused imports
        core.info(formatSection("Checking imports..."));
        const allFiles = utils.findAllCodeFiles(projectRoot);
        console.log(`Scanning ${allFiles.length} file(s)...\n`);

        for (const file of allFiles) {
            const unused = importCheck.checkUnusedImports(file);

            if (unused.length > 0) {
                hasUnusedImports = true;
                totalUnusedImports += unused.length;

                core.warning(`\nUnused imports in ${formatFile(file)}:`);
                unused.forEach(i => console.log(formatItem(i)));
            }
        }

        if (!hasUnusedImports) {
            console.log(`All imports are being used\n`);
        } else {
            console.log("");
        }

        // Final summary
        console.log("\nSUMMARY\n-------\n");

        if (hasUnusedImports) {
            console.log(`Status: FAILED`);
            console.log(`Found ${totalUnusedImports} unused import(s) that should be removed`);
            if (hasUnusedDeps) {
                console.log(`Found ${totalUnusedDeps} unused dependency(ies)`);
            }
            console.log(`\nAction Required: Remove unused imports to pass this check\n`);
            core.setFailed("Unused imports detected!");
        } else if (hasUnusedDeps) {
            console.log(`Status: WARNING`);
            console.log(`Found ${totalUnusedDeps} unused dependency(ies)`);
            console.log(`All imports are clean`);
            console.log(`\nTip: Consider removing unused dependencies to reduce bundle size\n`);
            core.warning("Unused dependencies detected (but imports are clean).");
        } else {
            console.log(`Status: PASSED`);
            console.log(`All imports are used`);
            console.log(`All dependencies are used`);
            console.log(`\nYour project is clean and optimized!\n`);
            core.info("No issues found. Your project is clean!");
        }

    } catch (error) {
        console.log(`\nERROR: ${error.message}\n`);
        core.setFailed(error.message);
    }
}

run();