import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function createLink(targetPage: number) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", String(targetPage));

    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      <Link
        href={createLink(Math.max(page - 1, 1))}
        className={`rounded-lg border px-4 py-2 ${
          page === 1
            ? "pointer-events-none opacity-50"
            : "hover:bg-slate-100"
        }`}
      >
        Previous
      </Link>

      <span className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </span>

      <Link
        href={createLink(Math.min(page + 1, totalPages))}
        className={`rounded-lg border px-4 py-2 ${
          page === totalPages
            ? "pointer-events-none opacity-50"
            : "hover:bg-slate-100"
        }`}
      >
        Next
      </Link>
    </div>
  );
}