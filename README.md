# Design System Components POC

This POC is a small React + TypeScript component library arranged with atomic design conventions. Components live in `src/atoms` and `src/molecules`, are exported from package subpaths, and are exercised through Storybook.

## What is included

- Lightweight, reusable atoms: `Button`, `TextInput`, and `Checkbox`.
- Higher-order molecules: `FormField` and `LoginForm`.
- Storybook stories for every component with controls and interaction tests.
- Functional tests that run against the components in Storybook using Storybook Test Runner.
- Reusable Playwright performance tests that use Storybook stories as the render harness.

## Scripts

```sh
npm run storybook
npm run build:all
npm test
npm run test:functional:ci
npm run test:perf
```

`npm run build:all` typechecks, builds the component package, and builds Storybook. `npm test` runs the full suite: typecheck, Storybook functional tests, and performance tests. `npm run storybook` builds the shared Storybook instance and serves it at `http://127.0.0.1:6006`.

## Import examples

```tsx
import { Button } from "@poc/design-system-components/atoms/Button";
import { LoginForm } from "@poc/design-system-components/molecules/LoginForm";
import "@poc/design-system-components/styles.css";
```

## Performance harness

Performance scenarios are configured in `perf/component-perf.config.ts`. Each case points at Storybook story IDs and declares budgets. The generic test runner in `perf/component-performance.spec.ts` can be extended for new components by adding another case, without changing the test logic.

## Component authoring

See `docs/creating-a-component.md` for the full workflow to add a component, Storybook functional tests, and performance tests.
