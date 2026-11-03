import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Dialog, type DialogProps } from "./Dialog";
import { Button } from "../../atoms/Button";
import { TextInput } from "../../atoms/TextInput";

function Example(
  args: Omit<DialogProps, "isOpen" | "onOpenChange" | "children">,
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit profile</Button>
      <Dialog {...args} isOpen={open} onOpenChange={setOpen}>
        <TextInput aria-label="Display name" defaultValue="Alex Morgan" />
        <div className="ds-form-actions">
          <Button onClick={() => setOpen(false)}>Save profile</Button>
        </div>
      </Dialog>
    </>
  );
}
const meta = {
  title: "Molecules/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    title: "Edit profile",
    isDismissable: true,
    isOpen: false,
    onOpenChange: () => undefined,
    children: null,
  },
  argTypes: { isOpen: { control: false }, children: { control: false } },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Edit profile" });
    await step("Opening moves focus into the modal", async () => {
      await userEvent.click(trigger);
      const dialog = await body.findByRole("dialog", { name: "Edit profile" });
      await waitFor(() =>
        expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(
          true,
        ),
      );
    });
    await step("Tab wraps inside the dialog", async () => {
      body.getByRole("button", { name: "Save profile" }).focus();
      await userEvent.tab();
      await expect(
        body.getByRole("button", { name: "Close dialog" }),
      ).toHaveFocus();
    });
    await step("Escape closes and restores focus", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};
export const ExplicitDismissal: Story = {
  args: { isDismissable: false, isKeyboardDismissDisabled: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Edit profile" }),
    );
    await body.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await expect(body.getByRole("dialog")).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "Close dialog" }));
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};
