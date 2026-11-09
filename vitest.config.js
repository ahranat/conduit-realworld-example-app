import react from "@vitejs/plugin-react-swc";
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, "tests/be.integration/**", "tests/e2e/**", "tests/fe.integration/**"],
    environment: "jsdom",
    setupFiles: "frontend/src/setupTests.js",
    css: true,
  },
});
