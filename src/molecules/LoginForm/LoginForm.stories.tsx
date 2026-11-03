import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
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

export const ValidationAndRecovery: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText("Email");
    const password = canvas.getByLabelText("Password");
    const submit = canvas.getByRole("button", { name: "Sign in" });
    await step("Empty required fields block submission", async () => {
      await userEvent.click(submit);
      await expect(email).toBeInvalid();
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });
    await step("Malformed email blocks submission", async () => {
      await userEvent.type(email, "not-an-email");
      await userEvent.type(password, "demo-password");
      await userEvent.click(submit);
      await expect(email).toBeInvalid();
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });
    await step("Correcting the email allows keyboard submission", async () => {
      await userEvent.clear(email);
      await userEvent.type(email, "demo@example.com");
      await userEvent.type(password, "{Enter}");
      await expect(args.onSubmit).toHaveBeenCalledTimes(1);
      await expect(args.onSubmit).toHaveBeenCalledWith({
        email: "demo@example.com", password: "demo-password", remember: false
      });
    });
  }
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Tab order follows the form fields and actions", async () => {
      canvas.getByLabelText("Email").focus();
      await userEvent.tab();
      await expect(canvas.getByLabelText("Password")).toHaveFocus();
      await userEvent.tab();
      await expect(canvas.getByRole("checkbox")).toHaveFocus();
      await userEvent.tab();
      await expect(canvas.getByRole("button")).toHaveFocus();
    });
  }
};
