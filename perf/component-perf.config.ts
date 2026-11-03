import type { Page } from "@playwright/test";

export interface ComponentPerfBudgets {
  memoryGrowthKb: number;
  renderMs: number;
  scaleRenderMs: number;
}

export interface ComponentPerfCase {
  budgets: ComponentPerfBudgets;
  memoryIterations: number;
  name: string;
  scaleCount: number;
  selector: string;
  storyId: string;
  lifecycleStoryId: string;
  exercise?: (page: Page) => Promise<void>;
}

export const componentPerfCases: ComponentPerfCase[] = [
  {
    name: "Button",
    lifecycleStoryId: "performance-lifecycle-scenarios--button-lifecycle",
    storyId: "atoms-button--primary",
    selector: "button",
    scaleCount: 240,
    memoryIterations: 12,
    budgets: {
      renderMs: 900,
      scaleRenderMs: 1400,
      memoryGrowthKb: 2048,
    },
  },
  {
    name: "TextInput",
    lifecycleStoryId: "performance-lifecycle-scenarios--text-input-lifecycle",
    storyId: "atoms-textinput--default",
    selector: "input",
    scaleCount: 240,
    memoryIterations: 12,
    budgets: {
      renderMs: 900,
      scaleRenderMs: 1500,
      memoryGrowthKb: 2048,
    },
  },
  {
    name: "Checkbox",
    lifecycleStoryId: "performance-lifecycle-scenarios--checkbox-lifecycle",
    storyId: "atoms-checkbox--default",
    selector: "input[type='checkbox']",
    scaleCount: 240,
    memoryIterations: 12,
    budgets: {
      renderMs: 900,
      scaleRenderMs: 1500,
      memoryGrowthKb: 2048,
    },
  },
  {
    name: "FormField",
    lifecycleStoryId: "performance-lifecycle-scenarios--form-field-lifecycle",
    storyId: "molecules-formfield--with-help-text",
    selector: ".ds-form-field",
    scaleCount: 160,
    memoryIterations: 10,
    budgets: {
      renderMs: 1000,
      scaleRenderMs: 1800,
      memoryGrowthKb: 3072,
    },
  },
  {
    name: "LoginForm",
    lifecycleStoryId: "performance-lifecycle-scenarios--login-form-lifecycle",
    storyId: "molecules-loginform--default",
    selector: ".ds-login-form",
    scaleCount: 24,
    memoryIterations: 8,
    budgets: {
      renderMs: 1200,
      scaleRenderMs: 2400,
      memoryGrowthKb: 4096,
    },
  },
];

const additions: {
  name: string;
  group: string;
  slug: string;
  selector: string;
  count: number;
  exercise?: ComponentPerfCase["exercise"];
}[] = [
  {
    name: "Label",
    group: "atoms",
    slug: "label",
    selector: "label",
    count: 160,
  },
  {
    name: "Badge",
    group: "atoms",
    slug: "badge",
    selector: ".ds-badge",
    count: 240,
  },
  {
    name: "IconButton",
    group: "atoms",
    slug: "icon-button",
    selector: "button",
    count: 160,
  },
  {
    name: "Spinner",
    group: "atoms",
    slug: "spinner",
    selector: "[role=status]",
    count: 160,
  },
  {
    name: "RadioGroup",
    group: "atoms",
    slug: "radio-group",
    selector: ".ds-radio-group",
    count: 40,
  },
  {
    name: "Switch",
    group: "atoms",
    slug: "switch",
    selector: ".ds-switch",
    count: 80,
  },
  {
    name: "TextArea",
    group: "atoms",
    slug: "text-area",
    selector: "textarea",
    count: 160,
  },
  {
    name: "Dialog",
    group: "molecules",
    slug: "dialog",
    selector: "button",
    count: 24,
    exercise: async (page) => {
      await page
        .getByRole("button", { name: "Open dialog", exact: true })
        .click();
      await page.getByRole("dialog", { name: "Benchmark dialog" }).waitFor();
    },
  },
  {
    name: "Combobox",
    group: "molecules",
    slug: "combobox",
    selector: "input",
    count: 24,
    exercise: async (page) => {
      await page.getByRole("combobox").fill("Team 9");
      await page.getByRole("option", { name: "Team 9", exact: true }).waitFor();
    },
  },
  {
    name: "Tabs",
    group: "molecules",
    slug: "tabs",
    selector: "[role=tablist]",
    count: 40,
    exercise: async (page) => {
      await page.getByRole("tab", { name: "Notes", exact: true }).click();
    },
  },
  {
    name: "Toast",
    group: "molecules",
    slug: "toast",
    selector: "button",
    count: 12,
  },
  {
    name: "DataTable",
    group: "organisms",
    slug: "data-table",
    selector: "table",
    count: 12,
    exercise: async (page) => {
      await page.getByRole("button", { name: "Name", exact: true }).click();
      await page
        .getByRole("button", { name: "Next page", exact: true })
        .click();
    },
  },
  {
    name: "ValidatedForm",
    group: "organisms",
    slug: "validated-form",
    selector: "form",
    count: 24,
    exercise: async (page) => {
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await page.getByText("Name is required", { exact: true }).waitFor();
    },
  },
];

componentPerfCases.push(
  ...additions.map(({ name, group, slug, selector, count, exercise }) => ({
    name,
    selector,
    exercise,
    storyId: `${group}-${name.toLowerCase()}--default`,
    lifecycleStoryId: `performance-extended-lifecycle--${slug}-lifecycle`,
    scaleCount: count,
    memoryIterations: 8,
    budgets: { renderMs: 1800, scaleRenderMs: 2000, memoryGrowthKb: 4096 },
  })),
);
