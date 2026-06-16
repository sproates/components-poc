import type { BrowserContext, Page } from "@playwright/test";

const defaultBaseUrl = "http://127.0.0.1:6006";
const storyRootSelector = "#storybook-root";

export interface StoryRenderMetric {
  domContentLoadedMs: number;
  renderMs: number;
}

export interface ScaleMetric extends StoryRenderMetric {
  renderedCount: number;
}

export interface MemoryMetric {
  growthKb: number;
  samplesKb: number[];
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

export async function measureScale(
  page: Page,
  storyId: string,
  selector: string,
  count: number
): Promise<ScaleMetric> {
  const metric = await measureStoryRender(page, storyId, selector, { count });
  const renderedCount = await page.locator(`${storyRootSelector} [data-perf-subject]`).count();

  return {
    ...metric,
    renderedCount
  };
}

export async function measureMemoryGrowth(
  context: BrowserContext,
  page: Page,
  storyId: string,
  selector: string,
  iterations: number
): Promise<MemoryMetric> {
  const client = await context.newCDPSession(page);
  const samplesKb: number[] = [];

  for (let index = 0; index < iterations; index += 1) {
    await measureStoryRender(page, storyId, selector);
    await client.send("HeapProfiler.collectGarbage");
    samplesKb.push(await usedHeapKb(page));
  }

  await client.detach();

  return {
    growthKb: Math.max(0, samplesKb[samplesKb.length - 1] - samplesKb[0]),
    samplesKb
  };
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

async function usedHeapKb(page: Page) {
  const bytes = await page.evaluate(() => {
    const memory = (
      performance as Performance & {
        memory?: { usedJSHeapSize: number };
      }
    ).memory;
    return memory?.usedJSHeapSize ?? 0;
  });

  return Math.round(bytes / 1024);
}
