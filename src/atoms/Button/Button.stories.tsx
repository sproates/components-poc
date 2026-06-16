import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Save changes",
    onClick: fn(),
    size: "medium",
    variant: "primary"
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost", "danger"]
    },
    size: {
      control: "inline-radio",
      options: ["small", "medium", "large"]
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /save changes/i }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  }
};

export const Secondary: Story = {
  args: {
    children: "Cancel",
    variant: "secondary"
  }
};

export const Loading: Story = {
  args: {
    children: "Saving",
    isLoading: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /saving/i })).toBeDisabled();
  }
};

export const FullWidth: Story = {
  args: {
    fullWidth: true
  },
  parameters: {
    layout: "padded"
  }
};
