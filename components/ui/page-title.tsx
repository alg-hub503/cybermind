import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageTitle({
  title,
  description,
  actions,
}: PageTitleProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}