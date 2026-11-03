# Design System Components POC

This POC is an 18-component React + TypeScript library arranged with atomic design conventions. Components live in `src/atoms`, `src/molecules`, and `src/organisms`, are exported from package subpaths, and are exercised through Storybook.

## What is included

- Atoms: `Button`, `TextInput`, `Checkbox`, `Label`, `Badge`, `IconButton`, `Spinner`, `TextArea`, `Switch`, and `RadioGroup`.
- Molecules: `FormField`, `LoginForm`, `Dialog`, `Combobox`, `Tabs`, and `Toast`.
- Organisms: generic `DataTable` and configurable `ValidatedForm`.
- A searchable, editable records workspace combining the components, with an automated edit/validate/save/notify journey. Example-specific data and logic stay outside the published library.
- Storybook stories for every component with controls and interaction tests.
- Functional and accessibility tests using Storybook's Vitest browser addon and the same stories/preview configuration shown in the catalog.
- Reusable Playwright performance tests that use Storybook stories as the render harness.
- Healthy, slow-rendering, and leaking fixtures with measured comparisons and an opt-in red-test demo.

## Setup

Use Node 26 (`nvm use` if you use nvm), then:

```sh
npm ci
npm run install:browsers
```

Verified stack: React 19.3.1, Storybook 10.6.5, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.1.0 and Playwright 1.64.1. Node 26.0.0 was used for verification. React is a peer dependency for consumers, not bundled into the library.

## Scripts

Start with **Examples / Records Workspace / Default** in Storybook. **Edit Member Journey** replays the full interaction test. See [the component catalog](docs/component-catalog.md) for each component's API and demonstrations.

```sh
npm run storybook
npm run build:all
npm test
npm run test:functional
npm run test:perf
npm run report:perf
```

`npm run build:all` typechecks and builds the library and static Storybook. `npm test` also checks package exports/types and runs functional, accessibility, and performance tests. `npm run storybook` starts hot-reloading Storybook at `http://127.0.0.1:6006`. `npm run serve:storybook` serves an existing static build.

Functional tests run the Storybook preview through Vitest in Chromium; they do not require a running Storybook server. Performance commands build a fresh static Storybook and serve it on an isolated temporary port, so your open development server is not reused or stopped. `test:functional:ci` remains an alias for `test:functional`.

`npm run demo:failures` deliberately exits nonzero with two performance budget failures. It is excluded from `npm test`. Open the resulting report with `npm run report:perf`; each performance run replaces the previous report.

## Import examples

```tsx
import { Button } from "@poc/design-system-components/atoms/Button";
import { LoginForm } from "@poc/design-system-components/molecules/LoginForm";
import { DataTable } from "@poc/design-system-components/organisms/DataTable";
import "@poc/design-system-components/styles.css";
```

## Performance harness

Performance scenarios are configured in `perf/component-perf.config.ts`. Each case declares budgets and a lifecycle story using `PerformanceLab`. The generic runner checks navigation-to-visible timing, three-point render scalability, and retained heap after same-page mount/unmount cycles. The leak detector includes warmup, forced garbage collection, and a growth trend; it no longer reloads the page between samples.

All 18 components have lifecycle cases. Complex cases supply an optional `exercise(page)` callback before unmounting to open overlays, change tabs, sort/page a table or trigger validation. `perf/data-volume.spec.ts` additionally checks virtualized combobox filtering across 1,000 options and pagination/sorting across 10,000 table rows. These interaction timings include browser-automation overhead.

React Aria supplies focus, keyboard and selection behaviour; Radix supplies toast lifecycle management; React Hook Form supplies validation; TanStack Table v9's compatibility adapter supplies row models. Runtime dependencies are externalized from the library build and installed normally for consumers. Individual subpath imports avoid loading unrelated library components; dependency costs still apply to the components that use them.

See [the demo guide](docs/demo.md) for the presentation sequence, metrics, expected failures and limitations. Tests are regression signals, not proof that a component can never leak. Timing budgets are illustrative, not hardware-independent SLOs.

## Component authoring

See [Creating a Component](docs/creating-a-component.md) for the full workflow.

## Dependency Audit

On 2026-11-03, `npm audit --omit=dev` reported zero vulnerabilities. The full audit reported four moderate tooling advisories through Storybook's docgen plugin (`glob`/`minimatch`). npm's proposed forced fix downgrades Storybook to 8.5.3; it has not been applied. Do not expose the development server publicly or process untrusted repositories with these tools. Recheck upstream fixes before production adoption.
