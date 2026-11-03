import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { TextInput } from "../atoms/TextInput";
import { FormField } from "../molecules/FormField";
import { LoginForm } from "../molecules/LoginForm";
import { PerformanceLab } from "./PerformanceLab";

const meta = {
  title: "Performance/Lifecycle Scenarios",
  tags: ["performance"],
  parameters: { layout: "padded" }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function subjects(count: number, render: (index: number) => React.ReactNode) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} data-perf-subject="">{render(index)}</div>
  ));
}

export const ButtonLifecycle: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, (i) => <Button>Button {i}</Button>)} />
};
export const TextInputLifecycle: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, (i) => <TextInput aria-label={`Field ${i}`} />)} />
};
export const CheckboxLifecycle: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, (i) => <Checkbox label={`Option ${i}`} />)} />
};
export const FormFieldLifecycle: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, (i) => <FormField label={`Field ${i}`}><TextInput /></FormField>)} />
};
export const LoginFormLifecycle: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, () => <LoginForm onSubmit={() => undefined} />)} />
};

function ListenerFixture({ leak }: { leak: boolean }) {
  useEffect(() => {
    // About 1 MiB per mount, retained by a global event listener if cleanup is missing.
    const payload = new Array<number>(256 * 1024).fill(42);
    const listener = () => { payload[0] += 1; };
    window.addEventListener("benchmark-tick", listener);
    return () => {
      if (!leak) window.removeEventListener("benchmark-tick", listener);
    };
  }, [leak]);
  return <span>Listener mounted</span>;
}

export const CleanListener: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, () => <ListenerFixture leak={false} />)} />
};
export const LeakingListener: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, () => <ListenerFixture leak />)} />
};

function SlowFixture() {
  // Intentionally blocks the main thread; never exported from the component library.
  const start = performance.now();
  while (performance.now() - start < 15) { /* deliberate benchmark fault */ }
  return <span>Slow instance</span>;
}
export const SlowRender: Story = {
  render: () => <PerformanceLab renderSubjects={(count) => subjects(count, () => <SlowFixture />)} />
};
