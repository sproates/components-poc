import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { LoginForm } from "./LoginForm";

const meta = {
  title: "Molecules/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  args: {
    onSubmit: fn()
  }
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("Email"), "person@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "correct-horse");
    await userEvent.click(canvas.getByRole("checkbox", { name: /remember this device/i }));
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));

    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "correct-horse",
      remember: true
    });
  }
};

export const Submitting: Story = {
  args: {
    isSubmitting: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /sign in/i })).toBeDisabled();
  }
};
