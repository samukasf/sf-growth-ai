import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "node_modules.failed-install/**",
    "next-env.d.ts",
    // Samuel Desktop is an independent Electron/Windows package with its own compiler/workflow.
    "apps/samuel-desktop-agent/**",
  ]),
]);

export default eslintConfig;
