import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { Combobox } from "./Combobox";
const meta = {
  title: "Molecules/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: {
    label: "Team",
    onSelectionChange: fn(),
    options: [
      { id: "design", label: "Design" },
      { id: "engineering", label: "Engineering" },
      { id: "finance", label: "Finance", disabled: true },
    ],
  },
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Team" });
    const body = within(canvasElement.ownerDocument.body);
    await step("Typing filters the options", async () => {
      await userEvent.type(input, "Eng");
      await body.findByRole("option", { name: "Engineering" });
      await expect(
        body.queryByRole("option", { name: "Design" }),
      ).not.toBeInTheDocument();
    });
    await step("Keyboard selection emits the option ID", async () => {
      await userEvent.keyboard("{ArrowDown}{Enter}");
      await expect(input).toHaveValue("Engineering");
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
        "engineering",
      );
    });
    await step("Unmatched queries expose an empty state", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "no-such-team");
      await waitFor(() =>
        expect(body.getByText("No matching options")).toBeVisible(),
      );
      await userEvent.keyboard("{Escape}");
    });
  },
};
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox")).toBeDisabled();
  },
};
export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 1000 }, (_, i) => ({
      id: `team-${i}`,
      label: `Team ${String(i).padStart(4, "0")}`,
    })),
  },
};
export const DisabledOption: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button"));
    const option = await body.findByRole("option", { name: "Finance" });
    await expect(option).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(option);
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
  },
};
