import type { BrowserContext, Page } from "@playwright/test";

const defaultBaseUrl = "http://127.0.0.1:6006";
const storyRootSelector = "#storybook-root";

export interface StoryRenderMetric {
  domContentLoadedMs: number;
  renderMs: number;
}

export interface MemoryMetric {
  growthKb: number;
  samplesKb: number[];
  slopeKbPerCycle: number;
}

export function storyUrl(
  storyId: string,
  args?: Record<string, string | number | boolean>,
  baseUrl = process.env.STORYBOOK_URL ?? defaultBaseUrl
) {
  const url = new URL("/iframe.html", baseUrl);
  url.searchParams.set("id", storyId);
  url.searchParams.set("viewMode", "story");

  if (args && Object.keys(args).length > 0) {
    url.searchParams.set(
      "args",
      Object.entries(args)
        .map(([key, value]) => `${key}:${String(value)}`)
        .join(";")
    );
  }

  return url.toString();
}

export async function measureStoryRender(
  page: Page,
  storyId: string,
  selector: string,
  args?: Record<string, string | number | boolean>
): Promise<StoryRenderMetric> {
  const start = performance.now();
  await page.goto(storyUrl(storyId, args), { waitUntil: "domcontentloaded" });
  const domContentLoadedMs = performance.now() - start;
  await page.locator(`${storyRootSelector} ${selector}`).first().waitFor({ state: "visible" });
  await waitForStableAnimationFrame(page);

  return {
    domContentLoadedMs,
    renderMs: performance.now() - start
  };
}

export async function measureMemoryGrowth(
  context: BrowserContext,
  page: Page,
  storyId: string,
  iterations: number,
  exercise?: (page: Page) => Promise<void>
): Promise<MemoryMetric> {
  if (!Number.isInteger(iterations) || iterations < 2) throw new Error("At least two memory cycles are required");
  await openLifecycleStory(page, storyId);
  const client = await context.newCDPSession(page);
  const samplesKb: number[] = [];
  try {
    // Warm React and Storybook caches before taking a baseline. Never navigate in this loop.
    for (let index = 0; index < 3; index += 1) await lifecycleCycle(page, exercise);
    for (let index = 0; index <= iterations; index += 1) {
      if (index > 0) await lifecycleCycle(page, exercise);
      await client.send("HeapProfiler.collectGarbage");
      const { usedSize } = await client.send("Runtime.getHeapUsage");
      if (!Number.isFinite(usedSize) || usedSize <= 0) throw new Error("Heap measurement unavailable");
      samplesKb.push(Math.round(usedSize / 1024));
    }
  } finally {
    await client.detach();
  }
  const meanX = (samplesKb.length - 1) / 2;
  const meanY = samplesKb.reduce((a, b) => a + b, 0) / samplesKb.length;
  const slope = samplesKb.reduce((sum, y, x) => sum + (x - meanX) * (y - meanY), 0)
    / samplesKb.reduce((sum, _, x) => sum + (x - meanX) ** 2, 0);
  return {
    growthKb: Math.max(0, samplesKb[samplesKb.length - 1] - samplesKb[0]),
    samplesKb,
    slopeKbPerCycle: Math.round(slope * 10) / 10
  };
}

async function lifecycleCycle(page: Page, exercise?: (page: Page) => Promise<void>) {
  await page.evaluate(async () => {
    if (!window.componentPerf) throw new Error("Missing component benchmark controller");
    await window.componentPerf.mount(1);
  });
  await exercise?.(page);
  await page.evaluate(() => window.componentPerf!.unmount());
  if (await page.locator("[data-benchmark-subjects] [data-perf-subject]").count() !== 0) {
    throw new Error("Benchmark failed to unmount its subjects");
  }
}

async function openLifecycleStory(page: Page, storyId: string) {
  await page.goto(storyUrl(storyId));
  await page.waitForFunction(() => Boolean(window.componentPerf));
}

export async function measureRenderCurve(page: Page, storyId: string, counts: number[]) {
  await openLifecycleStory(page, storyId);
  await lifecycleCycle(page);
  const points = [];
  for (const count of counts) {
    const samplesMs: number[] = [];
    for (let sample = 0; sample < 3; sample += 1) {
      const duration = await page.evaluate(async (instances) => {
        const controller = window.componentPerf!;
        await controller.unmount();
        const start = performance.now();
        await controller.mount(instances);
        const rendered = document.querySelectorAll("[data-benchmark-subjects] [data-perf-subject]").length;
        if (rendered !== instances) throw new Error(`Expected ${instances} subjects, got ${rendered}`);
        return performance.now() - start;
      }, count);
      samplesMs.push(duration);
    }
    const sorted = [...samplesMs].sort((a, b) => a - b);
    points.push({ count, medianMs: sorted[1], samplesMs });
  }
  await page.evaluate(() => window.componentPerf!.unmount());
  return points;
}

export async function attachMetric(
  testInfo: { attach: (name: string, options: { body: string; contentType: string }) => Promise<void> },
  name: string,
  metric: unknown
) {
  await testInfo.attach(name, {
    body: JSON.stringify(metric, null, 2),
    contentType: "application/json"
  });
}

async function waitForStableAnimationFrame(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}
