import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Pencil } from "lucide-react";
import { IconButton } from "./IconButton";
const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: { label: "Edit record", children: <Pencil size={18} />, onClick: fn() },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Edit record",
    });
    await expect(button).toHaveAttribute("title", "Edit record");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
