import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Inbox
          size={30}
          className="text-slate-500"
        />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-slate-900">
        {title}
      </h2>

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