# Component Testing Demo

## Purpose And Opening

"We already have component stories and automated tests. This PoC explores how to make behaviour checks visible alongside the components, and how to check runtime costs that a working UI or bundle-size report won't reveal."

The objective is to show an executable component contract, then a component that looks correct but retains memory after unmount. Don't spend the session touring all 18 components. Keep the wider catalog available for questions.

## Presenter Cue Sheet (15 minutes)

| Time | Show | Say |
| --- | --- | --- |
| 0-2 min | Button controls, then Records Workspace / Default | Components remain individually reusable; the workspace shows them working together. |
| 2-5 min | ValidatedForm / Default and Records Workspace / Edit Member Journey; run selected component tests in Storybook | These stories check outcomes, including validation recovery and the composed editing journey. The Vitest addon makes results visible beside the example. |
| 5-8 min | Run the focused detector comparisons; open both charts in the report | A passing detector test means it accepts the healthy fixture AND identifies the deliberately faulty one. |
| 8-11 min | Compare Clean Listener and Leaking Listener source, then run the negative cases | Both look correct. Missing cleanup retains an array through a window listener. An ordinary budget assertion now makes the run fail. |
| 11-13 min | Open the two red results and their measured values | These failures are measured heap growth and rendering cost, not simulated failure badges. |
| 13-15 min | Recommendations below | Pilot this around existing coverage; don't duplicate every unit test or introduce arbitrary performance gates. |

The performance report is separate from Storybook's functional testing widget. Make that distinction explicit during the transition.

## Before Presenting

Use Node 26. On a fresh checkout, run `npm ci` and `npm run install:browsers`. On this already-installed demo checkout, don't reinstall immediately before presenting. Run `npm run build:all` and `npm test` beforehand. Keep the terminal in the repository root.

Start `npm run storybook`, then open http://127.0.0.1:6006. Leave it running; test commands use separate servers. Allow about 15 minutes for the sequence below.

Use three terminal tabs: Storybook, test commands, and the report server. `npm run report:perf` stays running in the foreground; use Ctrl+C to stop it, not Ctrl+Z. Typing another command while it is serving the report won't run that command in the shell.

Both runners explicitly select full Chromium with `channel: "chromium"`. This avoided a separate headless-shell startup crash seen from macOS Terminal. A browser crash or timeout is an infrastructure problem, not a successful negative demo. Restart Storybook after changing the Vitest configuration so its testing widget picks up the change.

Before the talk, rehearse from the actual presenting Terminal. Capture the comparison charts and red budget assertions as screenshots outside the repository for backup. If the live run fails to start, show the saved evidence and say it is from rehearsal; don't describe the startup error as a detected component fault.

## 1. Establish The Component Library (2 minutes)

Start with **Examples / Records Workspace / Default** for the composed experience: filter members, edit a record, change access, save, and inspect its notification and Activity entry. Then open **Edit Member Journey** and show the same workflow replayed with assertions. The library now has 10 atoms, 6 molecules and 2 organisms; see [the catalog](component-catalog.md).

Open Atoms/Button and change its variant, size, and loading controls. Show the atoms and molecules in the sidebar. Open Molecules/LoginForm to show composition without authentication/network logic.

Show `src/atoms`, `src/molecules`, and the package subpath exports. `npm run test:package` checks the built JavaScript exports and TypeScript consumer imports. Run `npm run build` first when using that command alone.

## 2. Demonstrate Functional Contracts (4 minutes)

Open each story, inspect its Interactions steps, and replay it:

| Story | What the assertions demonstrate |
| --- | --- |
| Button / Keyboard Activation | Enter and Space invoke the callback exactly once each |
| Button / Disabled Prevents Events | Disabled state prevents callback invocation |
| TextInput / Edit And Clear | Editing, clearing, and native maximum-length constraints |
| Checkbox / Keyboard Toggle | A reversible state transition using Space |
| FormField / Preserves Accessible Relationships | Custom IDs retain label focus and existing accessible descriptions |
| LoginForm / Validation And Recovery | Empty and malformed values block submission; corrected values submit the exact payload |
| LoginForm / Keyboard Navigation | Tab order traverses the form controls predictably |

Show a `play` function: `step` names the contract, `userEvent` supplies input, and `expect` checks observable behavior. These are real Chromium browser tests, not simulated DOM tests. Stories without a `play` function still receive render and automated accessibility checks.

For the richer component tour, show Dialog's focus trap/restoration, Combobox's keyboard search and disabled option, DataTable's sorting/page selection, Tabs' preserved panel state, Toast's auto-dismiss, and ValidatedForm's cross-field and conditional-field checks. All seven new atoms also have their own stories and functional checks.

Run `npm run test:functional`, or use Storybook's testing widget to run tests for a selected story. Accessibility violations are configured as errors. Automated accessibility checks are not a substitute for manual keyboard/screen-reader evaluation.

Keep the live demo on the checked-in code. The performance fixtures below provide negative cases without editing assertions during the talk.

## 3. Show Render Scalability (3 minutes)

Open Performance / Component Scenarios / Button Scale and vary `count` to inspect repeated instances. Then open Performance / Lifecycle Scenarios / Button Lifecycle and use Mount 1, Mount 100, and Unmount.

For the live demo, run only the two detector comparisons:

```sh
node scripts/run-tests.mjs perf --grep "detector accepts"
```

Expected: **2 passed**. In the report terminal, run `npm run report:perf`. Open the detector test for blocking work and its "Render cost at increasing scale" chart attachment. The healthy button stays inexpensive; the intentionally slow fixture spends roughly 15 ms of CPU time per instance. At 30 instances it exceeds the 250 ms demonstration budget. Use `npm run test:perf` outside the short demo to run the whole performance suite.

The default suite passes because it asserts that the detector rejects this known-bad fixture, as well as accepting the healthy one. A detector that never flags the fault fails this control test.

Also show **Combobox / Many Options** and **DataTable / Large Dataset**. The performance report includes two data-volume checks: 1,000 options with a virtualized DOM and 10,000 rows with only one rendered page. They measure filtering or sorting/paging latency, including automation overhead. These are separate from the many-instance tests.

## 4. Show A Real Retention Leak (3 minutes)

In the report, open the cleanup comparison and its "Retained heap after cleanup" chart. Both fixtures allocate an array and register a window event listener on mount. One removes the listener on unmount; the other deliberately omits that cleanup. The surviving listener closure retains the array even though React removed the component.

The test stays in one document throughout its cycles. It warms up three mount/unmount cycles, forces garbage collection, records a baseline, then records heap usage after each additional cycle. With cleanup, retained heap should remain approximately flat. Without cleanup, it grows each cycle. The heap samples and fitted slope are attached as JSON.

The fixture retains about 1 MiB per mount on the verified Chromium build. Exact allocation size depends on the engine. Reloading the story clears its deliberately retained listeners. Do not repeatedly mount hundreds of leaking instances during a live presentation.

## 5. Make The Build Go Red (2 minutes)

Run:

```sh
npm run demo:failures
```

Before this run, finish showing the comparison charts: every performance run replaces the previous report. Stop the report server with Ctrl+C, run the negative tests in the test terminal, then restart `npm run report:perf` in the report terminal and refresh the browser.

Expect exit code 1 and exactly two failing tests: the leaking listener exceeds its 2 MiB (2,048 KiB) budget, and the blocking-render fixture exceeds its 250 ms budget. These use ordinary budget assertions, not "expected failure" annotations. Inspect the actual measured values and failure traces. Earlier rehearsal measurements were about 10 MiB of retained heap and 467 ms at 30 instances; these are illustrative observations, not exact values to promise live.

"The component still renders. The additional check tells us it leaves resources behind, or becomes too expensive when used repeatedly. That's the value beyond a functional assertion."

After the presentation, `npm test` returns to the normal suite, with the two intentional failures skipped. It regenerates the healthy comparison charts. Don't run it until you've finished showing the negative report.

## Recommendations And Owners

- **Platform team:** pilot `@storybook/addon-vitest` in the shared Storybook, starting with existing assertion-bearing stories. Connect the same tests to CI and check how they fit the current test jobs.
- **Component owners:** choose an important behaviour that is missing coverage or hard to inspect. Add a story-driven assertion where it improves feedback, rather than duplicating an existing unit test.
- **Performance pilot owners:** select one expensive list and one component with subscriptions, listeners or timers. Measure scaling and cleanup with representative interactions. Establish repeatable baselines on stable hardware before adopting blocking budgets.
- **For each pilot:** introduce a controlled regression, demonstrate that the check detects it, then restore the correct implementation. Agree who investigates failures and where the evidence is published.

These are proposed pilots, not a claim that teams lack testing today. Keep existing unit, integration and bundle-analysis checks. The added capability is visible story-based validation and measured runtime behaviour.

## What The Metrics Mean

- `renderMs`: navigation to the story, first visible subject, then two animation-frame callbacks. Includes Storybook startup, asset loading and browser-automation overhead; not isolated React render time.
- `scaleRenderMs`: maximum permitted median mount time at each tested scale (1, half the configured maximum, and the maximum). Three fresh mounts are sampled per scale. Timing occurs inside the browser after the story has loaded, includes synchronous React work plus two animation-frame callbacks, and checks the complete subject count before stopping. It is a rendering proxy, not a guarantee that every pixel or async resource has settled.
- `samplesMs`: the raw three measurements at a scale; `medianMs` is their middle value.
- `samplesKb`: post-GC JavaScript heap samples from Chromium's `Runtime.getHeapUsage`, including the warmed baseline. Despite the historical `Kb` name, values are KiB (bytes / 1024).
- `growthKb`: positive final-minus-baseline heap delta, tested against `memoryGrowthKb`.
- `slopeKbPerCycle`: least-squares trend across all heap samples. Component checks also compare it with the allowed total growth divided by the number of cycles.

## Scope And Limits

Performance results depend on machine load, browser, refresh rate and rendering mode. Use stable CI hardware and repeated runs before tightening budgets. Each case currently has one memory trial and three timing samples per scale; these are regression checks, not a statistical benchmark study.

The heap test is Chromium-specific. It catches retained JavaScript in the exercised lifecycle, not every DOM, GPU, native-resource, interaction-triggered, or long-lived async leak. It does not wait for arbitrary background requests to finish. Missing heap metrics fail instead of silently reporting zero. A clean result does not prove leak freedom; add relevant interactions and use heap snapshots to investigate a regression.

The stories use React's standard Storybook renderer rather than a production profiling build. The benchmarks are useful for same-environment comparisons, not precise production React commit measurements.

Functional tests use Storybook's Vitest preview harness, not HTTP navigation to the built site. Performance tests use the actual built `iframe.html`. Both use the same component implementations and story definitions.
