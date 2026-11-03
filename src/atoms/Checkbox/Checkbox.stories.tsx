import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "Remember this device"
  }
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: /remember this device/i });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  }
};

export const Checked: Story = {
  args: {
    defaultChecked: true
  }
};

export const KeyboardToggle: Story = {
  play: async ({ canvasElement, step }) => {
    const checkbox = within(canvasElement).getByRole("checkbox");
    checkbox.focus();
    await step("Space checks the checkbox", async () => {
      await userEvent.keyboard(" ");
      await expect(checkbox).toBeChecked();
    });
    await step("Space again reverses the state", async () => {
      await userEvent.keyboard(" ");
      await expect(checkbox).not.toBeChecked();
    });
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", { name: /remember this device/i })).toBeDisabled();
  }
};
