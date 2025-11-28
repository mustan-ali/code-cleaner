const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

module.exports = {
    checkUnusedImports(filePath) {
        try {
            const code = fs.readFileSync(filePath, "utf-8");

            const ast = parser.parse(code, {
                sourceType: "module",
                plugins: ["jsx", "typescript"]
            });

            const importedNames = [];
            const usedNames = new Set();
            let hasJSX = false;

            traverse(ast, {
                ImportDeclaration({ node }) {
                    node.specifiers.forEach(spec => {
                        importedNames.push(spec.local.name);
                    });
                },
                // Check if file uses JSX
                JSXElement() {
                    hasJSX = true;
                },
                JSXFragment() {
                    hasJSX = true;
                },
                // Collect all used identifiers (default + named + JSX)
                ReferencedIdentifier(path) {
                    usedNames.add(path.node.name);
                }
            });

            // Filter out unused imports
            const unused = importedNames.filter(name => !usedNames.has(name));

            // If file has JSX, don't flag React as unused (it's used implicitly)
            if (hasJSX) {
                return unused.filter(name => name !== "React");
            }

            return unused;

        } catch (e) {
            return [];
        }
    }
};
