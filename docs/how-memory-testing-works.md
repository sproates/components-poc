# How Memory Testing Works

The PoC uses Playwright to open a lifecycle story in a real Chromium browser. A shared harness repeatedly mounts and unmounts the component, then measures how much JavaScript heap remains after garbage collection.

The question is: **does memory keep accumulating after the component has been removed?**

## Measurement Cycle

The implementation is in [perf/harness.ts](../perf/harness.ts), in `measureMemoryGrowth`.

1. Open the component's lifecycle story once.
2. Run three warm-up mount/unmount cycles to reduce the effect of initial React and Storybook cache allocations.
3. Force garbage collection and record the baseline JavaScript heap size.
4. Mount one component instance.
5. Run the optional `exercise` callback, such as opening a dialog or changing a table page.
6. Unmount the component and verify that its benchmark subject elements have disappeared.
7. Force garbage collection using Chromium's DevTools Protocol, then read the used heap size.
8. Repeat for the configured number of cycles.

The page is **not reloaded between cycles**. Reloading would discard the page's resources and could conceal a leak.

Garbage collection uses `HeapProfiler.collectGarbage`; heap measurement uses `Runtime.getHeapUsage`. These checks therefore depend on Chromium and its DevTools Protocol.

## What Makes A Test Fail?

The harness returns:

| Metric | Meaning |
| --- | --- |
| `samplesKb` | Post-garbage-collection heap measurements, including the baseline. |
| `growthKb` | Final heap size minus baseline, clamped to zero if the heap shrinks. |
| `slopeKbPerCycle` | Linear regression slope across all samples, expressing the trend in retained memory per cycle. |

Despite the `Kb` suffix, these values use **KiB**: bytes divided by 1024.

The standard component tests in [perf/component-performance.spec.ts](../perf/component-performance.spec.ts) require both:

```ts
growthKb <= memoryGrowthKb
slopeKbPerCycle <= memoryGrowthKb / memoryIterations
```

The first assertion checks total retained growth. The second checks the trend across the samples. Neither requires the heap to return to precisely the same size every time.

## Changing The Memory Budget

Edit [perf/component-perf.config.ts](../perf/component-perf.config.ts). For example, Button has:

```ts
memoryIterations: 12,
budgets: {
  renderMs: 900,
  scaleRenderMs: 1400,
  memoryGrowthKb: 2048,
},
```

`memoryGrowthKb: 2048` permits up to 2 MiB of retained growth across the measured cycles. With 12 cycles, the slope limit is approximately 170.7 KiB per cycle.

These are **test thresholds, not browser memory limits**. Increasing the budget makes the test more permissive. Increasing the number of cycles also changes the derived slope threshold, so consider both settings together.

The additional components registered through the `additions` array currently share the defaults in its mapping at the bottom of the configuration file: eight cycles and a 4096 KiB budget. Changing those defaults affects all of those entries.

Choose budgets using repeated healthy runs on the intended test environment, with room for normal variation. Investigate a regression before increasing a threshold. Compare runs using consistent browser versions, fixtures and workloads.

## Exercising Cleanup Paths

Some resources appear only after interaction. A dialog may register listeners when opened, for example. The optional `exercise` callback runs after each mount, including warm-up cycles, and before unmounting.

Use it to reach the state whose cleanup matters. An idle-state test cannot establish that every interaction cleans up correctly.

Lifecycle stories use [PerformanceLab](../src/performance/PerformanceLab.tsx) to expose the mount/unmount controller. Adding a component currently requires a lifecycle story and a configuration entry. Automatic discovery is not implemented.

## The Deliberate Leak

[LifecycleScenarios.stories.tsx](../src/performance/LifecycleScenarios.stories.tsx) contains two versions of the same listener fixture:

- **Cleanup present:** unmounting removes a window event listener, allowing its captured array to be collected.
- **Cleanup missing:** the window retains the listener, which retains the array even after the component disappears.

Each mount allocates an array intended to retain roughly 1 MiB in the demonstration browser. The exact allocation size is engine-dependent.

The comparison test in [perf/detection.spec.ts](../perf/detection.spec.ts) checks that the clean fixture stays below the budget and the faulty fixture exceeds it. It also checks the faulty fixture's growth rate and its separation from the clean result.

That comparison test passes when the detector correctly distinguishes healthy and faulty cleanup. The opt-in intentional failure instead applies a normal under-budget assertion to the leaking fixture, producing a real failed test.

The demonstration has its own threshold at the top of `perf/detection.spec.ts`:

```ts
const heapBudgetKb = 2048;
```

Changing a normal component's budget does not change this demonstration threshold.

## Running And Inspecting The Tests

Run from the repository root. The performance runner builds a fresh static Storybook and serves it for the tests.

```sh
# Run component memory checks only
npm run test:perf -- --grep "does not show sustained heap growth"

# Verify the detector distinguishes clean and leaking fixtures
node scripts/run-tests.mjs perf --grep "detector accepts cleanup"

# Open the latest performance report
npm run report:perf
```

The report includes JSON measurements. The detector comparison also attaches a chart showing retained growth over successive cycles. Stop the report server with Ctrl+C when finished. Each performance run replaces the previous report.

To show intentional failures:

```sh
npm run demo:failures
```

This runs both the deliberate memory leak and the slow-render fixture. Two budget assertion failures and a non-zero exit code are expected. A browser crash, timeout or missing file is an infrastructure error, not evidence that a component exceeded a performance budget.

## Limits Of The Check

A pass means the tested scenario stayed within its retained-heap budgets for the measured cycles. It does not prove that the component is leak-free.

- The measurement covers the page's JavaScript heap, including React and Storybook. It does not isolate allocations belonging only to the component.
- It is not a measurement of total browser process memory, GPU memory or every native resource.
- Small leaks, delayed leaks and untested interaction paths can escape detection.
- Garbage collection and runtime caches introduce variation. Warm-up cycles reduce that effect but do not eliminate it.
- Growth identifies a symptom, not the retaining object. Use heap snapshots and allocation profiling to investigate the cause.

The value is a repeatable regression check alongside functional tests, with controlled faulty fixtures demonstrating that it can catch the targeted failure mode.
