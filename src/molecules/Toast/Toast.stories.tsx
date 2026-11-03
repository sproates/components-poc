import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Toast, type ToastProps, type ToastMessage } from "./Toast";
import { Button } from "../../atoms/Button";
function Example({ duration }: Pick<ToastProps, "duration">) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const [nextId, setNextId] = useState(1);
  return (
    <>
      <Button
        onClick={() => {
          setMessages((items) => [
            ...items,
            {
              id: String(nextId),
              title: `Saved ${nextId}`,
              description: "Your changes are saved.",
            },
          ]);
          setNextId((id) => id + 1);
        }}
      >
        Save changes
      </Button>
      <Toast
        messages={messages}
        duration={duration}
        onDismiss={(id) =>
          setMessages((items) => items.filter((item) => item.id !== id))
        }
      />
    </>
  );
}
const meta = {
  title: "Molecules/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: { duration: 5000, messages: [], onDismiss: () => undefined },
  argTypes: { messages: { control: false } },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Notifications stack independently", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Save changes" }),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "Save changes" }),
      );
      await expect(body.getByText("Saved 1")).toBeVisible();
      await expect(body.getByText("Saved 2")).toBeVisible();
    });
    await step("Dismissing one leaves the other intact", async () => {
      await userEvent.click(
        body.getByRole("button", { name: "Dismiss Saved 1" }),
      );
      await waitFor(() =>
        expect(
          body.queryByRole("button", { name: "Dismiss Saved 1" }),
        ).not.toBeInTheDocument(),
      );
      await expect(body.getByText("Saved 2")).toBeVisible();
      await userEvent.click(
        body.getByRole("button", { name: "Dismiss Saved 2" }),
      );
    });
  },
};
export const AutoDismiss: Story = {
  args: { duration: 250 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByText("Saved 1")).toBeVisible();
    await waitFor(
      () => expect(canvas.queryByText("Saved 1")).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};
