import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  flexRender,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  useLegacyTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "../../atoms/Checkbox";
import { IconButton } from "../../atoms/IconButton";

export interface DataColumn<T> {
  id: string;
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}
export interface DataTableProps<T> {
  label: string;
  data: T[];
  columns: DataColumn<T>[];
  getRowId: (row: T) => string;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  label,
  data,
  columns,
  getRowId,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  useEffect(() => {
    setPagination((current) => current.pageSize === pageSize ? current : { pageIndex: 0, pageSize });
  }, [pageSize]);
  const definitions = useMemo<LegacyColumnDef<T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.label,
        accessorFn: column.value,
        enableSorting: column.sortable !== false,
        cell: (context) =>
          column.render
            ? column.render(context.row.original)
            : String(context.getValue() ?? ""),
      })),
    [columns],
  );
  // TanStack v9's compatibility adapter owns the row models.
  const table = useLegacyTable({
    data,
    columns: definitions,
    getRowId,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: (update) => {
      const next = typeof update === "function" ? update(rowSelection) : update;
      setRowSelection(next);
      onSelectionChange?.(Object.keys(next).filter((id) => next[id]));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <section className="ds-data-table" aria-label={label}>
      <div className="ds-table-scroll">
        <table>
          <caption className="ds-sr-only">{label}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {selectable && (
                  <th scope="col">
                    <Checkbox
                      label={
                        <span className="ds-sr-only">Select this page</span>
                      }
                      checked={table.getIsAllPageRowsSelected()}
                      disabled={!data.length}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                  </th>
                )}
                {group.headers.map((header) => {
                  const sort = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sort === "asc"
                          ? "ascending"
                          : sort === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.column.getCanSort() ? (
                        <button
                          className="ds-sort"
                          onClick={header.column.getToggleSortingHandler()}
                          title={`Sort by ${String(header.column.columnDef.header)}`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sort === "asc" ? (
                            <ArrowUp size={14} />
                          ) : sort === "desc" ? (
                            <ArrowDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-selected={row.getIsSelected() || undefined}>
                {selectable && (
                  <td>
                    <Checkbox
                      label={
                        <span className="ds-sr-only">Select {row.id}</span>
                      }
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </td>
                )}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td
                  className="ds-empty"
                  colSpan={columns.length + Number(selectable)}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="ds-table-footer">
        <span>
          {data.length} records
          {selectable
            ? ` / ${Object.keys(rowSelection).filter((id) => rowSelection[id] && data.some((row) => getRowId(row) === id)).length} selected`
            : ""}
        </span>
        <label>
          Rows{" "}
          <select
            aria-label="Rows per page"
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[...new Set([pageSize, 10, 25, 50])]
              .sort((a, b) => a - b)
              .map((size) => (
                <option key={size}>{size}</option>
              ))}
          </select>
        </label>
        <span>
          Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <IconButton
          label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft size={18} />
        </IconButton>
        <IconButton
          label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRight size={18} />
        </IconButton>
      </footer>
    </section>
  );
}
