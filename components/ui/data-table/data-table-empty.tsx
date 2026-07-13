import { Database } from "lucide-react";

interface DataTableEmptyProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function DataTableEmpty({
  title = "No data found",
  description = "There is nothing to display yet.",
  action,
}: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center">
      <div className="mb-5 rounded-full bg-slate-100 p-4">
        <Database
          size={36}
          className="text-slate-500"
        />
      </div>

      <h3 className="text-xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
