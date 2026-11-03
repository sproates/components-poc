import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Tabs } from "./Tabs";
import { TextInput } from "../../atoms/TextInput";
const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    label: "Record sections",
    items: [
      {
        id: "details",
        label: "Details",
        content: <TextInput aria-label="Draft name" />,
      },
      { id: "locked", label: "Billing", disabled: true, content: "Billing" },
      { id: "activity", label: "Activity", content: <p>No recent activity</p> },
    ],
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      "Arrow navigation skips disabled tabs and activates the panel",
      async () => {
        canvas.getByRole("tab", { name: "Details" }).focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(
          canvas.getByRole("tab", { name: "Activity" }),
        ).toHaveAttribute("aria-selected", "true");
        await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
          "No recent activity",
        );
        await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
      },
    );
  },
};
export const PreservedPanelState: Story = {
  args: { keepMounted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox"), "Unsaved draft");
    await userEvent.click(canvas.getByRole("tab", { name: "Activity" }));
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "Details" }));
    await expect(canvas.getByRole("textbox")).toHaveValue("Unsaved draft");
  },
};
