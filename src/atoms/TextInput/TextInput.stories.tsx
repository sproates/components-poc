import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { TextInput } from "./TextInput";

const meta = {
  title: "Atoms/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  args: {
    "aria-label": "Project name",
    placeholder: "Project name"
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "search"]
    }
  }
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /project name/i });
    await userEvent.type(input, "Component Suite");
    await expect(input).toHaveValue("Component Suite");
  }
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    defaultValue: "bad-value"
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: /project name/i })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Read only"
  }
};

export const EditAndClear: Story = {
  args: { defaultValue: "Old name", maxLength: 8 },
  play: async ({ canvasElement, step }) => {
    const input = within(canvasElement).getByRole("textbox");
    await step("Existing values can be cleared", async () => {
      await userEvent.clear(input);
      await expect(input).toHaveValue("");
    });
    await step("Native length constraints are respected", async () => {
      await userEvent.type(input, "1234567890");
      await expect(input).toHaveValue("12345678");
    });
  }
};
