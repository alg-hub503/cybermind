import { ReactNode } from "react";

interface Column {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  children: ReactNode;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  children,
  emptyMessage,
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed w-full">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
      {emptyMessage && (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

interface DataTableRowProps {
  children: ReactNode;
}

export function DataTableRow({ children }: DataTableRowProps) {
  return (
    <tr className="transition hover:bg-slate-50">
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function DataTableCell({
  children,
  align = "left",
  className = "",
}: DataTableCellProps) {
  return (
    <td
      className={`px-4 py-3 text-sm ${
        align === "right"
          ? "text-right"
          : align === "center"
            ? "text-center"
            : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}
