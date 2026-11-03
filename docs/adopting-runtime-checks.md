# Adding Runtime Performance And Cleanup Checks

This guide explains how to reuse the PoC's harness in another component library. Paths in the destination repository are design choices, not requirements. The integration must be verified in that repository.

Runtime checks can be introduced independently of the Vitest addon. They use Playwright against a built Storybook. Functional addon tests use the Vitest browser preview.

## Why Add These Checks?

Bundle analysis measures shipped code. Functional assertions check behaviour. Neither establishes that rendering remains affordable at scale or that memory is released after unmounting.

Start with one expensive list and one component with listeners, subscriptions or timers. Use deterministic fixtures and relevant interactions. Set budgets from measurements rather than imposing the PoC's illustrative thresholds everywhere.

## 1. Reuse The Shared Infrastructure

Place these files in the package that hosts Storybook, preserving their relative imports or adjusting them explicitly:

| PoC file | Purpose |
| --- | --- |
| [perf/harness.ts](../perf/harness.ts) | Shared browser measurements. |
| [perf/component-performance.spec.ts](../perf/component-performance.spec.ts) | Rendering, scaling and cleanup assertions generated from configuration. |
| [perf/component-perf.config.ts](../perf/component-perf.config.ts) | Component registrations and budgets. |
| [PerformanceLab.tsx](../src/performance/PerformanceLab.tsx) | Mount/unmount controller exposed by lifecycle stories. |
| [scripts/serve-storybook.mjs](../scripts/serve-storybook.mjs) | Local static Storybook server. |
| [scripts/run-tests.mjs](../scripts/run-tests.mjs) | Fresh build, temporary server, test execution and shutdown. |
| [playwright.perf.config.ts](../playwright.perf.config.ts) | Browser and test-runner settings. |

Adapt the following before running:

1. Replace the configuration's PoC component entries with the pilot entries.
2. Remove the lab's dependency on the PoC Button. Use native `<button type="button">` controls and remove the `variant` prop, or use an existing local control.
3. Preserve the controller, `flushSync`, animation-frame waits and benchmark data attributes. Replace the PoC grid class with explicit fixture styling.
4. Make the lab available to fixture stories through an internal test-support export or an appropriate local import. Keep it out of production component exports.
5. Match the server's static root to the destination's Storybook build output.
6. Adapt the runner's package-manager invocation, build script and executable paths. Forward arguments and propagate failures. Retain server cleanup on completion and interruption.
7. Keep the fresh-build, temporary-port approach and pass its address through `STORYBOOK_URL`. Do not reuse an unrelated development server.
8. Update or remove the copied Playwright `webServer` fallback so it cannot invoke stale PoC commands. If the wrapper is the only supported entry point, fail clearly when `STORYBOOK_URL` is missing.

Install a compatible `@playwright/test` in the package running the tests. Align Playwright versions if the functional browser runner also uses it. Keep browser installation and `PLAYWRIGHT_BROWSERS_PATH` consistent, or remove the custom path override and use the default cache throughout.

## 2. Create Discovered Lifecycle Stories

Place each fixture in a directory included by the destination's Storybook configuration. Check the actual discovery rules rather than assuming any file in the workspace will appear.

Use the component's real providers, theme and deterministic service mocks. Set `tags: ['performance']` on the fixture metadata. Exclude that tag from functional addon runs.

Render through `PerformanceLab`, marking every instance:

```tsx
// Substitute the actual component and representative props.
render: () => (
  <PerformanceLab renderSubjects={(count) =>
    Array.from({ length: count }, (_, index) => (
      <div key={index} data-perf-subject="">
        <ComponentUnderTest {...representativeProps} />
      </div>
    ))
  } />
)
```

The lab starts with zero subjects. Preserve `window.componentPerf`, `data-benchmark-subjects` and `data-perf-subject`: the harness uses them to detect readiness and verify mount/unmount counts. The current lab supports counts from 1 to 500.

Do not attach a `play` journey that competes with the controller. Obtain actual story IDs from the built Storybook's `index.json` rather than guessing from component names.

## 3. Register Components And Budgets

Add entries to the adapted `perf/component-perf.config.ts`:

```ts
{
  name: 'Pilot component',
  storyId: 'replace-with-real-normal-story-id',
  lifecycleStoryId: 'replace-with-real-lifecycle-story-id',
  selector: 'replace-with-visible-subject-selector',
  scaleCount: 30,
  memoryIterations: 12,
  budgets: {
    renderMs: 1800,
    scaleRenderMs: 2000,
    memoryGrowthKb: 2048,
  },
  // Optional: interact with the mounted component before unmounting.
  // exercise: async (page) => { ... },
}
```

The numbers are examples, not production recommendations. Each entry generates three checks:

- Initial story navigation to visible content, including startup overhead.
- Median mounting time at 1, half and maximum instance counts, with three samples per scale.
- Retained JavaScript heap after repeated mount/unmount cycles and garbage collection.

The optional `exercise` callback reaches states that allocate resources, such as an open overlay. It runs in memory cycles, not in scale measurements. Use a separate test for large-dataset filtering or other interaction latency.

See [How Memory Testing Works](how-memory-testing-works.md) for total-growth and slope limits, units and interpretation.

## 4. Add Commands

If retaining the PoC runner's mode interface, add:

```json
{
  "test:perf": "node scripts/run-tests.mjs perf",
  "report:perf": "playwright show-report"
}
```

Run from the package containing these scripts, using the repository's package manager. For npm:

```sh
npx playwright install chromium
npm run test:perf
npm run report:perf
```

Ignore generated Storybook output, `playwright-report`, `test-results` and local browser caches. Commit the harness, fixtures, configuration and lockfile, not browser binaries or generated reports.

## 5. Verify Controlled Faults

Adapt [perf/detection.spec.ts](../perf/detection.spec.ts), [perf/charts.ts](../perf/charts.ts) and the clean/leaking/slow fixtures in [LifecycleScenarios.stories.tsx](../src/performance/LifecycleScenarios.stories.tsx). Remove PoC component imports and use a native button as the healthy render control if appropriate.

Ensure the destination discovers these diagnostic stories and update the detector's story IDs. Keep diagnostic fixtures out of production exports.

```sh
npm run test:perf -- --grep "detector accepts"
DEMO_FAILURES=1 npm run test:perf -- --grep "intentional failures"
```

The comparison tests should pass because they distinguish healthy and faulty cases. The opt-in run should fail with measured heap/render budget assertions. Browser crashes and timeouts are infrastructure failures, not acceptance. Keep deliberate failures disabled in normal CI.

## 6. Establish Baselines And CI

Use repeated runs on the intended CI hardware. Keep browser version, viewport, fixtures and worker count consistent. Use one performance worker and avoid competing heavy workloads on the same runner.

Create an explicit CI job using the repository's existing runtime setup, dependency installation and authentication. After installation:

```sh
npx playwright install --with-deps chromium
npm run test:perf
```

Upload the performance report and test-results directories even when the job fails. Use distinct artifact names for parallel jobs. Reports include measurements and failure traces; detector comparisons also attach charts.

Start with visible, non-blocking results while collecting baselines. Make budgets blocking only when healthy results repeat reliably, controlled faults are detected and the thresholds have an explained basis.

Ensure shared configuration and fixture changes trigger the job. Do not assume an existing unit-test task discovers a new performance script. Disable task-result caching for performance execution; cached builds can be used separately with correct inputs.

## Adding Further Components

For each component, add a discovered lifecycle story, confirm its ID and subject markers, add a configuration entry and appropriate interactions, then review local and CI measurements. Standard checks reuse the shared algorithm.

Automatic registration is a proposed follow-up, not implemented in this PoC. Metadata discovery and scaffolding could reduce manual setup and require coverage or an exemption. They cannot invent representative data, interactions or suitable budgets.
