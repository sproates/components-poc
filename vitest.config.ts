import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

export default defineConfig({
  plugins: [storybookTest({
    configDir: import.meta.dirname + "/.storybook",
    tags: { exclude: ["performance"] }
  })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      // Match the performance runner: full Chromium, not the separate headless shell.
      provider: playwright({ launchOptions: { channel: "chromium" } }),
      headless: true,
      instances: [{ browser: "chromium", viewport: { width: 1280, height: 900 } }]
    }
  }
});
