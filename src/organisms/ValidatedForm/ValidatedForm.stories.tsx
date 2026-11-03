import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { ValidatedForm } from "./ValidatedForm";
const meta = {
  title: "Organisms/ValidatedForm",
  component: ValidatedForm,
  tags: ["autodocs"],
  args: {
    label: "Create account",
    onSubmit: fn(),
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      {
        name: "confirmation",
        label: "Confirm password",
        type: "password",
        required: true,
        validate: (value, values) =>
          value === values.password || "Passwords must match",
      },
      {
        name: "company",
        label: "Company",
        helpText: "Enter a company to add a billing note",
      },
      {
        name: "note",
        label: "Billing note",
        type: "textarea",
        visibleWhen: (values) => Boolean(values.company),
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(420px, 90vw)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ValidatedForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Required validation focuses the first error", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await expect(await canvas.findByText("Email is required")).toBeVisible();
      await waitFor(() => expect(canvas.getByLabelText("Email")).toHaveFocus());
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });
    await step("Cross-field mismatch blocks submission", async () => {
      await userEvent.type(canvas.getByLabelText("Email"), "alex@example.com");
      await userEvent.type(
        canvas.getByLabelText("Password", { exact: true }),
        "secret",
      );
      await userEvent.type(
        canvas.getByLabelText("Confirm password"),
        "different",
      );
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await expect(
        await canvas.findByText("Passwords must match"),
      ).toBeVisible();
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });
    await step(
      "Conditional fields appear and unregister when hidden",
      async () => {
        await userEvent.type(canvas.getByLabelText("Company"), "Acme");
        await userEvent.type(
          await canvas.findByLabelText("Billing note"),
          "Discard me",
        );
        await userEvent.clear(canvas.getByLabelText("Company"));
        await waitFor(() =>
          expect(
            canvas.queryByLabelText("Billing note"),
          ).not.toBeInTheDocument(),
        );
      },
    );
    await step("Recovery submits only the active field values", async () => {
      await userEvent.clear(canvas.getByLabelText("Confirm password"));
      await userEvent.type(canvas.getByLabelText("Confirm password"), "secret");
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await waitFor(() =>
        expect(args.onSubmit).toHaveBeenCalledWith({
          email: "alex@example.com",
          password: "secret",
          confirmation: "secret",
          company: "",
        }),
      );
    });
  },
};
export const SubmissionFailure: Story = {
  args: {
    defaultValues: {
      email: "alex@example.com",
      password: "secret",
      confirmation: "secret",
    },
    onSubmit: fn(async () => {
      throw new Error("The service is unavailable. Try again.");
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "The service is unavailable",
    );
    await expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();
  },
};
export const InvalidEmailAndReset: Story = {
  args: {
    defaultValues: {
      email: "alex@example.com",
      password: "secret",
      confirmation: "secret",
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByLabelText("Email"));
    await userEvent.type(canvas.getByLabelText("Email"), "invalid-email");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(
      await canvas.findByText("Enter a valid email address"),
    ).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByLabelText("Email")).toHaveValue(
      "alex@example.com",
    );
    await expect(
      canvas.queryByText("Enter a valid email address"),
    ).not.toBeInTheDocument();
  },
};
