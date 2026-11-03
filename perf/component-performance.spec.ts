import { expect, test } from "@playwright/test";
import { componentPerfCases } from "./component-perf.config";
import { attachMetric, measureMemoryGrowth, measureRenderCurve, measureStoryRender } from "./harness";

test.describe("Storybook component performance", () => {
  for (const componentCase of componentPerfCases) {
    test(`${componentCase.name} renders within budget`, async ({ page }, testInfo) => {
      const metric = await measureStoryRender(page, componentCase.storyId, componentCase.selector);

      await attachMetric(testInfo, `${componentCase.name}-render`, metric);
      expect(metric.renderMs).toBeLessThanOrEqual(componentCase.budgets.renderMs);
    });

    test(`${componentCase.name} scales within budget`, async ({ page }, testInfo) => {
      const curve = await measureRenderCurve(
        page,
        componentCase.lifecycleStoryId,
        [1, Math.ceil(componentCase.scaleCount / 2), componentCase.scaleCount]
      );
      await attachMetric(testInfo, `${componentCase.name}-scale-curve`, curve);
      for (const point of curve) {
        expect(point.medianMs, `${point.count} instances exceeded scaleRenderMs`).toBeLessThanOrEqual(componentCase.budgets.scaleRenderMs);
      }
    });

    test(`${componentCase.name} does not show sustained heap growth`, async ({
      context,
      page
    }, testInfo) => {
      const metric = await measureMemoryGrowth(
        context,
        page,
        componentCase.lifecycleStoryId,
        componentCase.memoryIterations,
        componentCase.exercise
      );

      await attachMetric(testInfo, `${componentCase.name}-memory`, metric);
      expect(metric.growthKb).toBeLessThanOrEqual(componentCase.budgets.memoryGrowthKb);
      expect(metric.slopeKbPerCycle).toBeLessThanOrEqual(componentCase.budgets.memoryGrowthKb / componentCase.memoryIterations);
    });
  }
});
