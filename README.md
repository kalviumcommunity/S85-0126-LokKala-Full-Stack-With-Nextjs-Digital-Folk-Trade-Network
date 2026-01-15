# Digital Folk Trade Network

## Project Setup

This project uses **Next.js**, **TypeScript**, **ESLint**, **Prettier**, **Husky**, and **lint-staged** for a modern, maintainable codebase.

---

## Code Quality Tools

### ESLint

- **Config:** Extends `next/core-web-vitals` and `plugin:prettier/recommended`
- **Rules:**
  - `"no-console": "warn"` – Warns if `console.log` is used, keeping code clean.
  - `"semi": ["error", "always"]` – Enforces semicolons for consistency.
  - `"quotes": ["error", "double"]` – Enforces double quotes for uniformity.

### Prettier

- **Config:**
  - `"singleQuote": false` – Uses double quotes.
  - `"semi": true` – Always adds semicolons.
  - `"tabWidth": 2` – Indents with 2 spaces.
  - `"trailingComma": "es5"` – Adds trailing commas where valid in ES5.

### TypeScript

- **Strict Configuration:**  
  - `"strict": true`, `"noImplicitAny": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"forceConsistentCasingInFileNames": true`
  - These settings catch undefined types, unused code, and casing mismatches early.

### Husky & lint-staged

- **Pre-commit hooks:**  
  - Automatically run ESLint and Prettier on staged files before each commit.
  - Prevents commits with lint errors or formatting issues.

---

## Why These Rules Matter

- **Consistency:** Enforced formatting and style rules make code easier to read and maintain.
- **Error Prevention:** Strict TypeScript and linting catch bugs before code is merged.
- **Automation:** Pre-commit hooks save time and keep the codebase clean.

---

## Example: Linting in Action

If you try to commit code like this:
```js
console.log('Hello world')
const unused = 42
```
You’ll see output like:
```
warning  Unexpected console statement  no-console
error    'unused' is assigned a value but never used  no-unused-vars
error    Missing semicolon  semi
```
The commit will be blocked until you fix these issues.

---

## Screenshots

_Add screenshots of linting errors in VS Code or terminal here._

---

## How to Use

1. Clone the repo and run `npm install`.
2. Make changes in a new branch.
3. Stage and commit your changes.
4. If linting fails, fix the issues and commit again.
5. Push your branch and open a pull request.

---

## Questions?

Open an issue or contact the maintainer for help.
