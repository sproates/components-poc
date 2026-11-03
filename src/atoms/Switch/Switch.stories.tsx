import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Switch } from "./Switch";
const meta = {
  title: "Atoms/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { label: "Email notifications", onChange: fn() },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const control = within(canvasElement).getByRole("switch");
    await step("Pointer and keyboard toggle the same state", async () => {
      await userEvent.click(control);
      await expect(control).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(true);
      await userEvent.keyboard(" ");
      await expect(control).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(false);
    });
  },
};
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("switch")).toBeDisabled();
  },
};
