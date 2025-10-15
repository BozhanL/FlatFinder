// https://docs.expo.dev/guides/using-eslint/
import expoConfig from "eslint-config-expo/flat.js";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  expoConfig,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",

      "@typescript-eslint/prefer-nullish-coalescing": "off",

      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  {
    ignores: ["dist/*"],
  },
  {
    // Test files only
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    ...testingLibrary.configs["flat/react"],
  },
  {
    // Test files only
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    rules: {
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    // This check will cause linter halt.
    // Maybe related to https://github.com/typescript-eslint/typescript-eslint/pull/11605
    rules: {
      "@typescript-eslint/no-deprecated": "off",
    },
  },
  {
    // https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
    rules: {
      "import/named": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default-member": "off",
    },
  },
  {
    rules: {
      curly: ["error", "all"],
    },
  },
]);
