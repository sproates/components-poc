import { expect, test } from "@playwright/test";
import { attachMetric, storyUrl } from "./harness";

test("a 1000-option combobox virtualizes its DOM and filters within budget", async ({
  page,
}, info) => {
  await page.goto(storyUrl("molecules-combobox--many-options"));
  await page.getByRole("button", { name: "Show Team options" }).click();
  await page.getByRole("option", { name: "Team 0000", exact: true }).waitFor();
  const mountedOptions = await page.getByRole("option").count();
  expect(mountedOptions).toBeGreaterThan(0);
  expect(mountedOptions).toBeLessThan(60);
  const start = performance.now();
  await page.getByRole("combobox").fill("Team 0999");
  await expect(
    page.getByRole("option", { name: "Team 0999", exact: true }),
  ).toBeVisible();
  const filterMs = performance.now() - start;
  await attachMetric(info, "option-volume", {
    totalOptions: 1000,
    mountedOptions,
    filterMs,
    budgetMs: 1500,
  });
  expect(filterMs).toBeLessThan(1500);
  await page.getByRole("combobox").press("ArrowDown");
  await page.getByRole("combobox").press("Enter");
  await expect(page.getByRole("combobox")).toHaveValue("Team 0999");
});

test("a 10000-row table keeps a bounded DOM while sorting and paging", async ({
  page,
}, info) => {
  await page.goto(storyUrl("organisms-datatable--large-dataset"));
  await expect(page.getByRole("table")).toBeVisible();
  const mountedRows = await page.getByRole("row").count();
  expect(mountedRows).toBe(26);
  const start = performance.now();
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await expect(
    page.getByRole("columnheader", { name: "Name" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByText("Member 00025", { exact: true })).toBeVisible();
  const interactionMs = performance.now() - start;
  await attachMetric(info, "row-volume", {
    totalRows: 10000,
    mountedRows,
    interactionMs,
    budgetMs: 1500,
  });
  expect(interactionMs).toBeLessThan(1500);
  expect(await page.getByRole("row").count()).toBe(26);
});
