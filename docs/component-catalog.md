# Component Catalog

All components have individual package exports, Storybook stories, browser functional/accessibility checks, and render/scale/retained-heap tests. Import shared CSS once using `@poc/design-system-components/styles.css`.

## Atoms

| Component  | Main inputs                                   | Demonstration                                    |
| ---------- | --------------------------------------------- | ------------------------------------------------ |
| Button     | Native button props, variant, size, isLoading | Keyboard activation and blocked events           |
| TextInput  | Native input props, isInvalid                 | Editing, limits, invalid and disabled states     |
| Checkbox   | Native checkbox props, label                  | Pointer/keyboard state transitions               |
| Label      | Native label props, required                  | Focus association; required marker is decorative |
| Badge      | tone, children                                | Textual statuses, not color alone                |
| IconButton | label, children, native button props          | Accessible name, native tooltip, disabled events |
| Spinner    | label, size                                   | Accessible status text, reduced-motion support   |
| TextArea   | Native textarea props, isInvalid              | Multiline editing and read-only state            |
| Switch     | React Aria switch props, label                | Controlled/uncontrolled toggle, disabled state   |
| RadioGroup | label, options, value/defaultValue, onChange  | Arrow-key selection skips disabled choices       |

## Molecules

| Component | Main inputs                                                       | Demonstration                                                                         |
| --------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| FormField | label, helpText, error, child control                             | IDs and descriptions preserved through composition                                    |
| LoginForm | onSubmit, labels, isSubmitting                                    | Credential payload and native validation; no authentication                           |
| Dialog    | isOpen, onOpenChange, title, children, dismissal flags            | Focus containment/restoration, Escape, explicit dismissal                             |
| Combobox  | label, options, selectedKey/defaultSelectedKey, onSelectionChange | Search, keyboard selection, empty/disabled states; auto-virtualizes above 100 options |
| Tabs      | label, items, selectedKey/defaultSelectedKey, keepMounted         | Keyboard navigation; optional preservation of inactive panel state                    |
| Toast     | messages, onDismiss, duration                                     | Controlled queue, stacking, manual and automatic dismissal                            |

Combobox option IDs must be unique. `virtualized` can override the automatic threshold. Its fixed 40px option rows use single-line ellipsis; accessible option names retain the full label.

Dialog is controlled: the caller updates `isOpen` in response to `onOpenChange`. Content is portaled, so interaction tests query the document body rather than only the story canvas.

Toast is also controlled: remove a message from `messages` when `onDismiss(id)` fires. Render one Toast collection per application region and assign unique message IDs. Radix manages timeouts, focus/hover pause, announcements, and dismissal. The lifecycle stress test intentionally mounts multiple independent collections; it is not a recommended application layout.

## Organisms

### DataTable

Accepts generic `data`, `columns`, `getRowId`, `label`, `pageSize`, `selectable`, and `onSelectionChange`. Each column supplies a stable `id`, label, sortable value accessor, and optional custom cell renderer. The caller owns data fetching and domain actions. Sorting and pagination are client-side. Selection emits stable row IDs; the header checkbox selects the current page.

The large-data story contains 10,000 rows but renders only the current page. This is pagination, not table virtualization. A separate performance check verifies the bounded DOM and sorting/paging latency. All data still lives in client memory; server-side pagination is outside this PoC's scope.

### ValidatedForm

Accepts `fields`, `defaultValues`, `onSubmit`, `submitLabel`, and an accessible `label`. Field definitions supply `name`, `label`, `type`, `required`, optional `validate(value, values)`, `visibleWhen(values)`, and help text. Field names must be unique and should not use React Hook Form's reserved `root` error key.

The library does not contain account or billing rules. Those are supplied by the example stories. Tests cover required/email/cross-field validation, first-error focus, conditional field unregistration, reset, and rejected async submission. `onSubmit` may return a promise; the form disables editing during that operation and exposes rejection messages as alerts. Default values initialize the form; reset returns to those values. Remount with a record key when editing another record, as the workspace does.

## Composed Example

**Examples / Records Workspace** combines the library into a member directory. Search and team/status filters narrow the table; edit opens a dialog containing access choices and validated fields; saving updates the table, activity panel, and notifications. Changes are local demonstration state and reset on reload. There is no backend or authentication.

**Default** is interactive without automatic edits. **Edit Member Journey** replays the full happy path plus validation recovery. Desktop and mobile layouts use the same components; narrow tables scroll horizontally within their own container.

## Performance Scope

`Performance / Extended Lifecycle` contains the 13 added lifecycle scenarios. The original five remain under `Performance / Lifecycle Scenarios`. Every case tests mount cost at three instance counts and post-GC heap retention. Label's case includes its associated input. Dialog scale tests mount closed triggers; its memory exercise opens the modal before unmounting. Combobox's exercise opens/filter its menu; Tabs switches panels; DataTable sorts and pages; ValidatedForm triggers errors. Toast mounts active notifications, exercising timer cleanup on unmount.

The generic `exercise` callback is intentionally optional. Add relevant interactions there for resources allocated only after interaction. These samples do not prove leak freedom, and budgets are illustrative until baselined on stable CI hardware.
