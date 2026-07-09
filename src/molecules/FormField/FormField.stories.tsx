import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { TextInput } from "../../atoms/TextInput";
import { FormField, type FormFieldProps } from "./FormField";

interface FormFieldStoryArgs extends Omit<FormFieldProps, "children"> {
  placeholder: string;
}

const meta = {
  title: "Molecules/FormField",
  tags: ["autodocs"],
  args: {
    helpText: "Use a concise, recognizable name.",
    label: "Project name",
    placeholder: "Project Atlas"
  },
  render: ({ placeholder, ...args }) => (
    <FormField {...args}>
      <TextInput placeholder={placeholder} />
    </FormField>
  )
} satisfies Meta<FormFieldStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHelpText: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /project name/i });
    await userEvent.type(input, "Atlas");
    await expect(input).toHaveValue("Atlas");
    await expect(input).toHaveAccessibleDescription(/concise/i);
  }
};

export const WithError: Story = {
  args: {
    error: "Project name is required.",
    helpText: undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: /project name/i })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  }
};
