import { expect, test } from "@playwright/test";
import { componentPerfCases } from "./component-perf.config";
import { attachMetric, measureMemoryGrowth, measureScale, measureStoryRender } from "./harness";

test.describe("Storybook component performance", () => {
  for (const componentCase of componentPerfCases) {
    test(`${componentCase.name} renders within budget`, async ({ page }, testInfo) => {
      const metric = await measureStoryRender(page, componentCase.storyId, componentCase.selector);

      await attachMetric(testInfo, `${componentCase.name}-render`, metric);
      expect(metric.renderMs).toBeLessThanOrEqual(componentCase.budgets.renderMs);
    });

    test(`${componentCase.name} scales within budget`, async ({ page }, testInfo) => {
      const metric = await measureScale(
        page,
        componentCase.scaleStoryId,
        componentCase.selector,
        componentCase.scaleCount
      );

      await attachMetric(testInfo, `${componentCase.name}-scale`, metric);
      expect(metric.renderedCount).toBe(componentCase.scaleCount);
      expect(metric.renderMs).toBeLessThanOrEqual(componentCase.budgets.scaleRenderMs);
    });

    test(`${componentCase.name} does not show sustained heap growth`, async ({
      context,
      page
    }, testInfo) => {
      const metric = await measureMemoryGrowth(
        context,
        page,
        componentCase.storyId,
        componentCase.selector,
        componentCase.memoryIterations
      );

      await attachMetric(testInfo, `${componentCase.name}-memory`, metric);
      expect(metric.growthKb).toBeLessThanOrEqual(componentCase.budgets.memoryGrowthKb);
    });
  }
});
