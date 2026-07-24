"use client";

import { Search } from "lucide-react";

interface SchoolSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SchoolSearch({
  value,
  onChange,
}: SchoolSearchProps) {
  return (
    <div className="relative w-full md:w-80">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        placeholder="Search schools..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 outline-none transition focus:border-blue-500"
      />
    </div>
  );
}