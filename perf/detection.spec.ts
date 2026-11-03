import { expect, test } from "@playwright/test";
import { attachMetric, measureMemoryGrowth, measureRenderCurve } from "./harness";
import { attachChart } from "./charts";

const prefix = "performance-lifecycle-scenarios--";
const heapBudgetKb = 2048;
const renderBudgetMs = 250;

test("detector accepts cleanup and rejects the missing-listener-cleanup fixture", async ({ page, context }, info) => {
  const clean = await measureMemoryGrowth(context, page, `${prefix}clean-listener`, 10);
  const leaking = await measureMemoryGrowth(context, page, `${prefix}leaking-listener`, 10);
  await attachMetric(info, "memory-comparison", { heapBudgetKb, clean, leaking });
  await attachChart(info, "Retained heap after cleanup", "Mount/unmount cycle", "Heap growth (KiB)", [
    { name: "Cleanup present", points: clean.samplesKb.map((y, x) => ({ x, y: Math.max(0, y - clean.samplesKb[0]) })) },
    { name: "Cleanup missing", points: leaking.samplesKb.map((y, x) => ({ x, y: Math.max(0, y - leaking.samplesKb[0]) })) }
  ]);
  expect(clean.growthKb).toBeLessThan(heapBudgetKb);
  expect(leaking.growthKb).toBeGreaterThan(heapBudgetKb);
  expect(leaking.slopeKbPerCycle).toBeGreaterThan(512);
  expect(leaking.growthKb - clean.growthKb).toBeGreaterThan(8192);
});

test("detector accepts normal rendering and rejects blocking work at scale", async ({ page }, info) => {
  const healthy = await measureRenderCurve(page, `${prefix}button-lifecycle`, [1, 10, 30]);
  const slow = await measureRenderCurve(page, `${prefix}slow-render`, [1, 10, 30]);
  await attachMetric(info, "render-comparison", { renderBudgetMs, healthy, slow });
  await attachChart(info, "Render cost at increasing scale", "Instances", "Median mount time (ms)", [
    { name: "Button", points: healthy.map((p) => ({ x: p.count, y: p.medianMs })) },
    { name: "Blocking work", points: slow.map((p) => ({ x: p.count, y: p.medianMs })) }
  ]);
  expect(healthy[2].medianMs).toBeLessThan(renderBudgetMs);
  expect(slow[2].medianMs).toBeGreaterThan(renderBudgetMs);
  expect(slow[2].medianMs).toBeGreaterThan(slow[0].medianMs * 3);
});

// Opt-in demos fail with real budget assertions. Never mark them test.fail(): the
// presenter should see an actual red test and its measurements in the HTML report.
test.describe("intentional failures", () => {
  test.skip(process.env.DEMO_FAILURES !== "1", "Run npm run demo:failures to show red budget checks");
  test("missing cleanup exceeds the heap budget", async ({ page, context }, info) => {
    const metric = await measureMemoryGrowth(context, page, `${prefix}leaking-listener`, 10);
    await attachMetric(info, "leak-over-budget", metric);
    await attachMetric(info, "demo-budget", { label: "Retained heap growth", measured: metric.growthKb, budget: heapBudgetKb, unit: "KiB" });
    expect(metric.growthKb).toBeLessThanOrEqual(heapBudgetKb);
  });
  test("blocking work exceeds the render budget", async ({ page }, info) => {
    const curve = await measureRenderCurve(page, `${prefix}slow-render`, [1, 10, 30]);
    await attachMetric(info, "slow-over-budget", curve);
    await attachMetric(info, "demo-budget", { label: "Render 30 instances", measured: curve[2].medianMs, budget: renderBudgetMs, unit: "ms" });
    expect(curve[2].medianMs).toBeLessThanOrEqual(renderBudgetMs);
  });
});
