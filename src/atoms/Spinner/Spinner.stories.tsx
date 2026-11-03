import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Spinner } from "./Spinner";
const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: { label: "Loading records", size: "medium" },
  argTypes: { size: { control: "inline-radio", options: ["small", "medium"] } },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      "Loading records",
    );
  },
};
