// eslint.config.js
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // For JavaScript files
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node, // use Node environment for JS too
    },
  },

  // For TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser, // let ESLint understand TS
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      globals: globals.node, // ✅ Node.js globals for backend
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
]);
