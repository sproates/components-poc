import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pencil } from "lucide-react";
import {
  Label,
  Badge,
  IconButton,
  Spinner,
  RadioGroup,
  Switch,
  TextArea,
  TextInput,
  Button,
} from "../atoms";
import { Dialog, Combobox, Tabs, Toast } from "../molecules";
import { DataTable, ValidatedForm } from "../organisms";
import { PerformanceLab } from "./PerformanceLab";

const meta = {
  title: "Performance/Extended Lifecycle",
  tags: ["performance"],
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const lab = (subject: (index: number) => ReactNode): Story => ({
  render: () => (
    <PerformanceLab
      renderSubjects={(count) =>
        Array.from({ length: count }, (_, i) => (
          <div key={i} data-perf-subject="">
            {subject(i)}
          </div>
        ))
      }
    />
  ),
});

export const LabelLifecycle = lab((i) => (
  <>
    <Label htmlFor={`perf-label-${i}`}>Name</Label>
    <TextInput id={`perf-label-${i}`} />
  </>
));
export const BadgeLifecycle = lab(() => <Badge tone="success">Active</Badge>);
export const IconButtonLifecycle = lab(() => (
  <IconButton label="Edit">
    <Pencil size={16} />
  </IconButton>
));
export const SpinnerLifecycle = lab(() => <Spinner />);
export const RadioGroupLifecycle = lab(() => (
  <RadioGroup
    label="Access"
    options={[
      { value: "viewer", label: "Viewer" },
      { value: "editor", label: "Editor" },
    ]}
  />
));
export const SwitchLifecycle = lab(() => <Switch label="Enabled" />);
export const TextAreaLifecycle = lab(() => <TextArea aria-label="Notes" />);

function DialogSubject() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog title="Benchmark dialog" isOpen={open} onOpenChange={setOpen}>
        <TextInput aria-label="Name" />
      </Dialog>
    </>
  );
}
export const DialogLifecycle = lab(() => <DialogSubject />);
export const ComboboxLifecycle = lab(() => (
  <Combobox
    label="Team"
    options={Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      label: `Team ${i}`,
    }))}
  />
));
export const TabsLifecycle = lab(() => (
  <Tabs
    label="Sections"
    items={[
      {
        id: "first",
        label: "Details",
        content: <TextInput aria-label="Name" />,
      },
      {
        id: "second",
        label: "Notes",
        content: <TextArea aria-label="Notes" />,
      },
    ]}
  />
));
export const ToastLifecycle = lab((i) => (
  <Toast
    duration={60000}
    messages={[{ id: String(i), title: "Benchmark notification" }]}
    onDismiss={() => undefined}
  />
));
export const DataTableLifecycle = lab(() => (
  <DataTable
    label="Records"
    data={Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Record ${i}`,
    }))}
    columns={[{ id: "name", label: "Name", value: (row) => row.name }]}
    getRowId={(row) => row.id}
    pageSize={10}
    selectable
  />
));
export const ValidatedFormLifecycle = lab(() => (
  <ValidatedForm
    fields={[
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
    ]}
    onSubmit={() => undefined}
  />
));
