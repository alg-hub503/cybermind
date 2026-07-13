"use client";

import Button from "@/components/ui/button";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function DataTablePagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4 md:flex-row">
      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-semibold text-slate-900">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900">
          {totalPages}
        </span>
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={page <= 1}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
