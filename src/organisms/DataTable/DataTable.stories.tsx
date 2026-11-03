import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { DataTable, type DataColumn } from "./DataTable";
interface Row {
  id: string;
  name: string;
  team: string;
}
const rows: Row[] = [
  { id: "alex", name: "Alex Morgan", team: "Design" },
  { id: "zoe", name: "Zoe Chen", team: "Engineering" },
  { id: "bea", name: "Bea Jones", team: "Operations" },
];
const columns: DataColumn<Row>[] = [
  { id: "name", label: "Name", value: (row) => row.name },
  { id: "team", label: "Team", value: (row) => row.team },
];
const meta = {
  title: "Organisms/DataTable",
  component: DataTable<Row>,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    label: "Members",
    data: rows,
    columns,
    getRowId: (row: Row) => row.id,
    pageSize: 2,
    selectable: true,
    onSelectionChange: fn(),
  },
} satisfies Meta<typeof DataTable<Row>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      "Sorting changes row order and announces direction",
      async () => {
        await userEvent.click(canvas.getByRole("button", { name: "Name" }));
        await expect(
          canvas.getByRole("columnheader", { name: "Name" }),
        ).toHaveAttribute("aria-sort", "ascending");
        await expect(canvas.getAllByRole("row")[1]).toHaveTextContent(
          "Alex Morgan",
        );
        await expect(canvas.getAllByRole("row")[2]).toHaveTextContent(
          "Bea Jones",
        );
      },
    );
    await step("Selection emits stable record IDs", async () => {
      await userEvent.click(
        canvas.getByRole("checkbox", { name: "Select alex" }),
      );
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["alex"]);
    });
    await step("Pagination preserves selection", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
      await expect(canvas.getByText("Zoe Chen")).toBeVisible();
      await expect(
        canvas.getByRole("button", { name: "Next page" }),
      ).toBeDisabled();
      await userEvent.click(
        canvas.getByRole("button", { name: "Previous page" }),
      );
      await expect(
        canvas.getByRole("checkbox", { name: "Select alex" }),
      ).toBeChecked();
    });
  },
};
export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No records found")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
  },
};
export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 10000 }, (_, i) => ({
      id: `row-${i}`,
      name: `Member ${String(i).padStart(5, "0")}`,
      team: i % 2 ? "Design" : "Engineering",
    })),
    pageSize: 25,
  },
};
export const PageSizeAndSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "Rows per page" }),
      "25",
    );
    await expect(canvas.getAllByRole("row")).toHaveLength(4);
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select this page" }),
    );
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith([
      "alex",
      "zoe",
      "bea",
    ]);
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select this page" }),
    );
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith([]);
  },
};
