import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { TextArea } from "./TextArea";
const meta = {
  title: "Atoms/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  args: { "aria-label": "Notes", placeholder: "Add notes" },
} satisfies Meta<typeof TextArea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Notes" });
    await step("Multiline editing retains line breaks", async () => {
      await userEvent.type(input, "First line{Enter}Second line");
      await expect(input).toHaveValue("First line\nSecond line");
      await userEvent.clear(input);
      await expect(input).toHaveValue("");
    });
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "Locked notes" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.type(input, "changed");
    await expect(input).toHaveValue("Locked notes");
  },
};
