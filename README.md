# Code Cleaner

Detects unused dependencies and unused imports across JavaScript/TypeScript projects and monorepos.

## Usage

Add to your workflow - no setup required:

```yaml
name: Code Cleaner

on: [push, pull_request]

jobs:
  check-unused:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mustan-ali/code-cleaner@v1
```

That's it! The action automatically scans your project and reports unused code.

## Features

- Detects unused ES6 imports in `.js`, `.ts`, `.jsx`, `.tsx` files
- Identifies unused dependencies in `package.json`
- Supports monorepos with multiple packages
- Fails CI/CD when unused imports are found
- Provides warnings for unused dependencies

## License

MIT
