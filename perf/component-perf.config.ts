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
  scaleStoryId: string;
  selector: string;
  storyId: string;
}

export const componentPerfCases: ComponentPerfCase[] = [
  {
    name: "Button",
    storyId: "atoms-button--primary",
    scaleStoryId: "performance-component-scenarios--button-scale",
    selector: "button",
    scaleCount: 240,
    memoryIterations: 12,
    budgets: {
      renderMs: 900,
      scaleRenderMs: 1400,
      memoryGrowthKb: 2048
    }
  },
  {
    name: "TextInput",
    storyId: "atoms-textinput--default",
    scaleStoryId: "performance-component-scenarios--text-input-scale",
    selector: "input",
    scaleCount: 240,
    memoryIterations: 12,
    budgets: {
      renderMs: 900,
      scaleRenderMs: 1500,
      memoryGrowthKb: 2048
    }
  },
  {
    name: "Checkbox",
    storyId: "atoms-checkbox--default",
    scaleStoryId: "performance-component-scenarios--checkbox-scale",
    selector: "input[type='checkbox']",
    scaleCount: 240,
    memoryIterations: 12,
    budgets: {
      renderMs: 900,
      scaleRenderMs: 1500,
      memoryGrowthKb: 2048
    }
  },
  {
    name: "FormField",
    storyId: "molecules-formfield--with-help-text",
    scaleStoryId: "performance-component-scenarios--form-field-scale",
    selector: ".ds-form-field",
    scaleCount: 160,
    memoryIterations: 10,
    budgets: {
      renderMs: 1000,
      scaleRenderMs: 1800,
      memoryGrowthKb: 3072
    }
  },
  {
    name: "LoginForm",
    storyId: "molecules-loginform--default",
    scaleStoryId: "performance-component-scenarios--login-form-scale",
    selector: ".ds-login-form",
    scaleCount: 24,
    memoryIterations: 8,
    budgets: {
      renderMs: 1200,
      scaleRenderMs: 2400,
      memoryGrowthKb: 4096
    }
  }
];
