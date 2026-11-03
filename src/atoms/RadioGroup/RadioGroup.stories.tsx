import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { RadioGroup } from "./RadioGroup";
const meta = {
  title: "Atoms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: {
    label: "Access level",
    defaultValue: "viewer",
    onChange: fn(),
    options: [
      { value: "viewer", label: "Viewer" },
      { value: "blocked", label: "Owner", disabled: true },
      { value: "editor", label: "Editor" },
    ],
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Arrow navigation skips disabled choices", async () => {
      canvas.getByRole("radio", { name: "Viewer" }).focus();
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByRole("radio", { name: "Editor" })).toBeChecked();
      await expect(
        canvas.getByRole("radio", { name: "Viewer" }),
      ).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith("editor");
    });
  },
};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
