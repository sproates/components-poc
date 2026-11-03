import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
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

export const PreservesAccessibleRelationships: Story = {
  render: (args) => (
    <>
      <p id="external-help">External guidance.</p>
      <FormField {...args}>
        <TextInput id="custom-input" aria-describedby="external-help" />
      </FormField>
    </>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("A supplied ID keeps the label associated", async () => {
      const input = canvas.getByRole("textbox", { name: "Project name" });
      await userEvent.click(canvas.getByText("Project name"));
      await expect(input).toHaveFocus();
      await expect(input).toHaveAttribute("id", "custom-input");
    });
    await step("Existing and field descriptions are both retained", async () => {
      await expect(canvas.getByRole("textbox")).toHaveAccessibleDescription(
        "External guidance. Use a concise, recognizable name."
      );
    });
  }
};
