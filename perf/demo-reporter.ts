import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class DemoReporter implements Reporter {
  onBegin() {
    console.log("\nDeliberately faulty components: applying normal budgets\n");
    console.log("Check                     Measured       Budget         Result");
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const attachment = result.attachments.find((item) => item.name === "demo-budget");
    if (!attachment?.body) {
      console.error(`ERROR: ${test.title} (${result.status})`);
      for (const error of result.errors) console.error(error.message);
      return;
    }
    const { label, measured, budget, unit } = JSON.parse(attachment.body.toString());
    const exceeded = measured > budget;
    const status = result.status === "failed" && exceeded ? "OVER BUDGET" : result.status.toUpperCase();
    console.log(`${label.padEnd(26)}${`${measured.toFixed(1)} ${unit}`.padEnd(15)}${`${budget} ${unit}`.padEnd(15)}${status}`);
    // Do not hide unrelated errors behind the expected budget failure.
    for (const error of result.errors) {
      if (!exceeded || !error.message?.includes("toBeLessThanOrEqual")) console.error(error.message);
    }
  }

  onError(error: { message?: string }) {
    console.error(error.message);
  }

  onEnd(result: FullResult) {
    console.log(`\nTest run: ${result.status}. This demo deliberately includes budget violations.`);
    console.log("Full details: npm run report:perf\n");
  }
}
