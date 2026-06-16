import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./perf",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:6006",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run build:storybook && npm run serve:storybook",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--js-flags=--expose-gc"]
        }
      }
    }
  ]
});
