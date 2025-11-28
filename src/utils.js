const fg = require("fast-glob");
const path = require("path");

module.exports = {
    findPackageJsonFiles(root) {
        return fg.sync(["**/package.json"], {
            cwd: root,
            ignore: ["**/node_modules/**"],
            absolute: true,
        });
    },

    findAllCodeFiles(root) {
        return fg.sync(
            ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
            {
                cwd: root,
                ignore: ["**/node_modules/**"],
                absolute: true,
            }
        );
    }
};
