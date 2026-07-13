"use client";

import { ReactNode } from "react";

import Input from "@/components/ui/input";

interface DataTableToolbarProps {
  title?: string;
  description?: string;

  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;

  children?: ReactNode;
}

export default function DataTableToolbar({
  title,
  description,
  search = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        {title && (
          <h2 className="text-2xl font-bold text-slate-900">
            {title}
          </h2>
        )}

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) =>
              onSearchChange?.(e.target.value)
            }
          />
        </div>

        {children}
      </div>
    </div>
  );
}
