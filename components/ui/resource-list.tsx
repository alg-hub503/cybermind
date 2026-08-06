"use client";

import { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

/**
 * ResourceList
 * -------------
 * Replaces <DataTable /> for small, low-density CRUD resources
 * (Academic Years, Grades, Classes — typically 1–15 rows, 2–4 fields).
 *
 * Why this exists instead of a table:
 * A <table> is built for column comparison across many rows. When a
 * resource only has one or two records, the table's header row and
 * grid structure produce empty horizontal space no matter how column
 * widths are tuned. ResourceList uses a vertical stack of flex rows
 * instead — each row is a self-contained unit, so the layout looks
 * intentional whether there's 1 row or 15.
 *
 * Usage:
 *   <ResourceList
 *     items={academicYears}
 *     keyField="id"
 *     renderPrimary={(item) => item.name}
 *     renderMeta={(item) => `${item.startDate} – ${item.endDate}`}
 *     renderBadge={(item) => item.isCurrent && <Badge>Current</Badge>}
 *     onEdit={(item) => openEditModal(item)}
 *     onDelete={(item) => confirmDelete(item)}
 *     emptyState={{ title: "No academic years yet", description: "Create one above to get started." }}
 *   />
 */

export interface ResourceListProps<T> {
  items: T[];
  keyField: keyof T;
  /** The item's name/identity — always shown, bold, left-aligned. */
  renderPrimary: (item: T) => ReactNode;
  /** Secondary info shown next to the primary label, muted text. */
  renderMeta?: (item: T) => ReactNode;
  /** Optional status pill (e.g. "Current"), shown after the meta text. */
  renderBadge?: (item: T) => ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyState?: {
    title: string;
    description?: string;
  };
}

export function ResourceList<T>({
  items,
  keyField,
  renderPrimary,
  renderMeta,
  renderBadge,
  onEdit,
  onDelete,
  emptyState,
}: ResourceListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          {emptyState?.title ?? "Nothing here yet"}
        </p>
        {emptyState?.description && (
          <p className="text-sm text-slate-400">{emptyState.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li
            key={String(item[keyField])}
            className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-sm font-semibold text-slate-900">
                {renderPrimary(item)}
              </span>

              {renderMeta && (
                <span className="hidden shrink-0 text-sm text-slate-400 sm:inline">
                  {renderMeta(item)}
                </span>
              )}

              {renderBadge && (
                <span className="shrink-0">{renderBadge(item)}</span>
              )}
            </div>

            {(onEdit || onDelete) && (
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label="Edit"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Small status pill, matching the existing "Current" badge style. */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
      {children}
    </span>
  );
}
