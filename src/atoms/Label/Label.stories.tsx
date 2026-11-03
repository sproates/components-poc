import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Label } from "./Label";
import { TextInput } from "../TextInput";
const meta = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
  args: { children: "Display name", required: true },
  render: (args) => (
    <div>
      <Label {...args} htmlFor="label-example" />
      <TextInput id="label-example" required={args.required} />
    </div>
  ),
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Clicking the label focuses its associated input", async () => {
      await userEvent.click(canvas.getByText("Display name", { exact: false }));
      await expect(
        canvas.getByRole("textbox", { name: "Display name" }),
      ).toHaveFocus();
      await expect(canvas.getByRole("textbox")).toBeRequired();
    });
  },
};
