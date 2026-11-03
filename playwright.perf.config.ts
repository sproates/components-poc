import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./perf",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [[process.env.DEMO_FAILURES === "1" ? "./perf/demo-reporter.ts" : "list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.STORYBOOK_URL ?? "http://127.0.0.1:6006",
    trace: "retain-on-failure"
  },
  webServer: process.env.STORYBOOK_URL ? undefined : {
    command: "npm run build:storybook && npm run serve:storybook",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use the full browser's headless mode, not the separate headless shell.
        channel: "chromium",
        launchOptions: {
          args: ["--js-flags=--expose-gc"]
        }
      }
    }
  ]
});
