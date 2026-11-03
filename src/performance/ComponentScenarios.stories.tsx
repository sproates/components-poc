import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { TextInput } from "../atoms/TextInput";
import { FormField } from "../molecules/FormField";
import { LoginForm } from "../molecules/LoginForm";

interface ScaleArgs {
  count: number;
}

function range(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

const meta: Meta<ScaleArgs> = {
  title: "Performance/Component Scenarios",
  tags: ["performance"],
  parameters: {
    layout: "padded",
    controls: {
      include: ["count"]
    }
  },
  args: {
    count: 120
  },
  argTypes: {
    count: {
      control: { type: "range", min: 1, max: 500, step: 1 }
    }
  }
};

export default meta;
type Story = StoryObj<ScaleArgs>;

export const ButtonScale: Story = {
  render: ({ count }) => (
    <div className="ds-perf-grid">
      {range(count).map((index) => (
        <Button data-perf-subject="" key={index} variant={index % 3 === 0 ? "secondary" : "primary"}>
          Button {index + 1}
        </Button>
      ))}
    </div>
  )
};

export const TextInputScale: Story = {
  render: ({ count }) => (
    <div className="ds-perf-grid">
      {range(count).map((index) => (
        <TextInput
          aria-label={`Field ${index + 1}`}
          data-perf-subject=""
          defaultValue={`Value ${index + 1}`}
          key={index}
        />
      ))}
    </div>
  )
};

export const CheckboxScale: Story = {
  render: ({ count }) => (
    <div className="ds-perf-grid">
      {range(count).map((index) => (
        <Checkbox
          data-perf-subject=""
          defaultChecked={index % 2 === 0}
          key={index}
          label={`Option ${index + 1}`}
        />
      ))}
    </div>
  )
};

export const FormFieldScale: Story = {
  render: ({ count }) => (
    <div className="ds-perf-grid">
      {range(count).map((index) => (
        <div data-perf-subject="" key={index}>
          <FormField label={`Field ${index + 1}`}>
            <TextInput defaultValue={`Value ${index + 1}`} />
          </FormField>
        </div>
      ))}
    </div>
  )
};

export const LoginFormScale: Story = {
  args: {
    count: 16
  },
  render: ({ count }) => (
    <div className="ds-perf-grid">
      {range(count).map((index) => (
        <div data-perf-subject="" key={index}>
          <LoginForm defaultEmail={`person${index + 1}@example.com`} onSubmit={() => undefined} />
        </div>
      ))}
    </div>
  )
};
