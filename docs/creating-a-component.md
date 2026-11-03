# Creating a Component

This guide describes how to add a reusable component to the library and make it available in Storybook, functional tests, and performance tests. The example uses a simple `Label` atom.

Label now exists in the library. Treat this as a worked walkthrough; choose a new component name when extending the suite.

## 1. Choose The Atomic Level

Place the component according to atomic design:

- Atoms: simple reusable primitives such as `Button`, `TextInput`, `Checkbox`, `Label`.
- Molecules: small compositions of atoms such as `FormField` or `LoginForm`.
- Organisms: larger reusable compositions such as `DataTable` or `ValidatedForm`. Keep domain-specific workflows in `src/examples`.

For `Label`, use:

```text
src/atoms/Label/
  Label.tsx
  Label.stories.tsx
  index.ts
```

## 2. Create The Component

Keep the component lightweight, generic, and free of business logic.

```tsx
// src/atoms/Label/Label.tsx
import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { classNames } from "../../utils/classNames";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, required = false, ...props }, ref) => {
    return (
      <label {...props} ref={ref} className={classNames("ds-label", className)}>
        <span>{children}</span>
        {required ? (
          <span aria-hidden="true" className="ds-label__required">
            *
          </span>
        ) : null}
      </label>
    );
  }
);

Label.displayName = "Label";
```

Export it from its folder:

```ts
// src/atoms/Label/index.ts
export * from "./Label";
```

## 3. Add Styles

Add reusable styles to `src/styles.css`. Prefer design tokens already defined in `:root`.

```css
.ds-label {
  color: var(--ds-color-text);
  display: inline-flex;
  font-family: var(--ds-font-family);
  font-size: 0.875rem;
  font-weight: 650;
  gap: var(--ds-space-1);
  line-height: 1.35;
}

.ds-label__required {
  color: var(--ds-color-danger);
}
```

## 4. Export The Component

Add the component to the atoms barrel:

```ts
// src/atoms/index.ts
export * from "./Label";
```

Add a package subpath export in `package.json`:

```json
"./atoms/Label": {
  "types": "./dist/atoms/Label/index.d.ts",
  "import": "./dist/Label.js"
}
```

Vite derives its library entries from `package.json` exports, so no separate build-entry list needs updating. Keep the component's source in `src/atoms/Label/index.ts` (or its corresponding atomic level).

After this, consumers can import the component directly:

```tsx
import { Label } from "@poc/design-system-components/atoms/Label";
```

## 5. Add Storybook Stories

Every component should have at least one Storybook story and enough variants to cover expected states.

Functional tests live inside Storybook `play` functions. Storybook's Vitest addon executes them in Chromium using the Storybook preview configuration. They can also be replayed in the Storybook UI. The accessibility addon is configured to fail tests on violations.

```tsx
// src/atoms/Label/Label.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Label } from "./Label";

const meta = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Email address",
    htmlFor: "email"
  }
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Label {...args} />
      <input id="email" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Email address")).toBeVisible();
  }
};

export const Required: Story = {
  args: {
    required: true
  }
};
```

## 6. Add A Performance Scenario

Performance tests use Storybook as the render harness. Add a scalable story in `src/performance/ComponentScenarios.stories.tsx`.

Import the component:

```tsx
import { Label } from "../atoms/Label";
```

Add a scale story:

```tsx
export const LabelScale: Story = {
  render: ({ count }) => (
    <div className="ds-perf-grid">
      {range(count).map((index) => (
        <Label data-perf-subject="" htmlFor={`field-${index}`} key={index}>
          Field {index + 1}
        </Label>
      ))}
    </div>
  )
};
```

Use `data-perf-subject=""` on each repeated unit. The generic harness counts these elements to verify the requested scale was rendered.

Also add a lifecycle story to `src/performance/LifecycleScenarios.stories.tsx`. Import `Label` there, then add:

```tsx
export const LabelLifecycle: Story = {
  render: () => (
    <PerformanceLab renderSubjects={(count) => subjects(count, (index) => (
      <Label htmlFor={`field-${index}`}>Field {index + 1}</Label>
    ))} />
  )
};
```

`PerformanceLab` exposes mount/unmount operations to the browser test. `subjects` adds the count markers. This is how the generic harness measures render cost and cleanup without navigating away between cycles. Keep benchmark utilities out of the package's public exports.

## 7. Register Performance Budgets

Add a new case to `perf/component-perf.config.ts`:

```ts
{
  name: "Label",
  storyId: "atoms-label--default",
  lifecycleStoryId: "performance-lifecycle-scenarios--label-lifecycle",
  selector: ".ds-label",
  scaleCount: 300,
  memoryIterations: 12,
  budgets: {
    renderMs: 900,
    scaleRenderMs: 1400,
    memoryGrowthKb: 2048
  }
}
```

Budget guidance:

- `renderMs`: navigation-to-visible smoke-test budget, including Storybook startup.
- `scaleRenderMs`: median same-page mount budget, checked at 1, half maximum, and maximum instances, with three samples each.
- `memoryGrowthKb`: allowed retained JavaScript heap growth after same-page mount/unmount cycles and garbage collection (KiB).
- `memoryIterations`: measured mount/unmount cycles after three warmup cycles and a baseline sample. The fitted growth slope is also checked.

Start with conservative budgets for a POC, then tighten them once you have stable baseline numbers in CI.

See [How Memory Testing Works](how-memory-testing-works.md) for measurement details and the healthy/leaking controls. Performance failures attach raw JSON; comparison tests also attach charts. `npm run demo:failures` demonstrates intentionally failing budgets and must not be used as the normal CI command.

## 8. Run Verification

Install browsers once if needed:

```sh
npm run install:browsers
```

Build everything:

```sh
npm run build:all
```

Run the full suite:

```sh
npm test
```

Run targeted checks while developing:

```sh
npm run typecheck
npm run test:functional:ci
npm run test:perf
```

Inspect Storybook in a browser:

```sh
npm run storybook
```

Then open `http://127.0.0.1:6006`.

## Checklist

- Component is generic and has no business logic.
- Component folder contains `Component.tsx`, `Component.stories.tsx`, and `index.ts`.
- Component styles use shared design tokens.
- Component is exported from its atomic or molecular barrel file.
- Component has a package subpath export in `package.json`.
- Component's package export resolves to its source folder and generated declarations.
- Storybook stories cover default and important variant states.
- Functional assertions are included in Storybook `play` functions.
- Scalable performance story exists in `src/performance/ComponentScenarios.stories.tsx`.
- Performance case and budgets are registered in `perf/component-perf.config.ts`.
- `npm run build:all` and `npm test` pass.
