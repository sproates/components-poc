# Adopting Story Tests In An Existing Repository

This guide describes how to pilot Storybook's Vitest addon alongside existing tests. It is a generic integration recipe, not a report on any organisation's implementation. Adapt paths and scripts to the target repository and verify the result there.

## Why Use The Addon?

The addon makes story test results available next to the component example and runs the same assertions through a CLI. It can improve feedback and investigation without replacing unit tests, application integration tests or bundle analysis.

## 1. Check The Starting Point

1. Identify the package containing the Storybook configuration and its story discovery rules.
2. Confirm that its framework uses Vite and that the chosen addon supports the installed Vitest version.
3. Check the repository's Node version, package manager, lockfile and dependency management conventions.
4. Find the shared decorators, service mocks, aliases and any generated preview configuration.
5. Run the existing tests and Storybook before making changes.

Choose one discovered story with a meaningful behavioural assertion for the initial pilot. A `play` function that only prepares state does not necessarily test an outcome.

The commands below assume execution inside the package that hosts Storybook, using npm. Use the equivalent workspace commands if the repository uses another package manager. Do not introduce a second lockfile or copy the PoC's dependency versions without checking compatibility.

## 2. Install And Configure

The official setup command is:

```sh
npx storybook add @storybook/addon-vitest
```

Review every generated change. Keep Storybook packages aligned and the Vitest browser provider compatible with Vitest. If the repository uses a dependency catalogue, declare versions there and use its existing reference syntax in package manifests.

The resulting setup needs:

- `@storybook/addon-vitest` registered in the existing Storybook addons array.
- A dedicated Vitest browser project using `storybookTest` from `@storybook/addon-vitest/vitest-plugin`.
- The Playwright browser provider and its browser binary.
- The correct Storybook configuration directory and preview annotations.

Install Chromium if setup has not already done so:

```sh
npx playwright install chromium
```

Do not replace an existing multi-project Vitest configuration with the PoC's single-project configuration. Preserve existing unit-test projects and add a separate browser project.

## 3. Preserve The Existing Environment

Use the generated configuration as the starting point. Set the Storybook test project's name to `storybook`, and point `configDir` at the existing `.storybook` directory.

Merge the relevant Vite settings rather than discarding package aliases, environment transformations or plugins. Keep jsdom-only setup out of the browser project. Check that providers, themes and service mocks work in both Storybook and the browser tests.

If preview configuration is generated, run that generator before CLI tests and edit its source template rather than its output. Store scripts in the package that owns the test configuration so relative paths resolve consistently.

For a limited pilot, add this filter to the existing `storybookTest` options:

```ts
tags: {
  include: ['storybook-pilot'],
  exclude: ['performance'],
}
```

Add `storybook-pilot` to the selected story's tags, preserving existing tags. Performance fixtures should use the `performance` tag so the functional runner does not interfere with their lifecycle controller.

The PoC explicitly selects full Chromium using `channel: 'chromium'` in the provider launch options. Keep browser installation and launch configuration consistent. The [PoC configuration](../vitest.config.ts) is a reference, not a drop-in replacement for every project.

## 4. Add Useful Assertions

Use existing shared test helpers where available, or import the helpers from `storybook/test`. Add awaited interactions and assertions to a story's `play` function.

Useful scenarios include:

- Keyboard activation and focus restoration.
- Disabled controls preventing callbacks.
- Invalid input blocking submission, followed by successful correction.
- Exact callback payloads after selection or editing.
- Conditional fields appearing and disappearing correctly.

Prefer accessible queries and observable outcomes. Mock services and use deterministic data. Choose a coverage gap rather than duplicating every unit test.

## 5. Verify Both Execution Paths

Add scripts appropriate to the generated configuration, for example:

```json
{
  "test:stories": "vitest run --project storybook",
  "test:stories:watch": "vitest --project storybook"
}
```

These commands assume a project named `storybook` in the default Vitest configuration. Add `--config <path>` when using a separate config, and prepend any required preview generation.

```sh
npm run test:stories
npm run storybook
```

Acceptance checks:

1. The selected story executes in Chromium and passes in the CLI.
2. Storybook's testing widget runs the same story and displays its result.
3. Temporarily invert a meaningful assertion and confirm that both paths fail.
4. Restore the assertion and rerun both paths.
5. Confirm that existing tests still pass and that the pilot executes at least one test.

If no tests run, inspect discovery paths, tags and configuration before changing assertions. Accessibility checks need an explicit policy for whether violations warn or fail; installing an addon is not itself that policy.

## 6. Connect CI Explicitly

Reuse the repository's existing runtime setup, package installation and registry authentication. Add a job or explicit task invocation for story tests. A new script does not automatically become part of an existing CI workflow.

After dependency installation, the job should run:

```sh
npx playwright install --with-deps chromium
npm run test:stories
```

Ensure changes to shared preview configuration, dependencies and discovered component stories trigger the job. Include its result in the required-check aggregation when ready. Preserve existing test jobs and publish useful failure output.

Expand the tagged pilot once the local workflow and CI are reliable. Treat package-local Storybooks and independently built Storybooks as explicit integration decisions.

## Next Steps

- [Add runtime performance and cleanup checks](adopting-runtime-checks.md).
- [Create a component and its tests in this PoC](creating-a-component.md).
- [Official Vitest addon setup](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon).
