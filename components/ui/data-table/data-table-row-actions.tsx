"use client";

import { MoreHorizontal } from "lucide-react";
import { ReactNode, useState } from "react";

interface DataTableRowActionsProps {
  children: ReactNode;
}

export default function DataTableRowActions({
  children,
}: DataTableRowActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 transition hover:bg-slate-100"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}
