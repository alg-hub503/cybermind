import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon?: ReactNode;
}

export default function StatCard({
  title,
  value,
  description,
  change,
  icon,
}: StatCardProps) {
  const hasChange = typeof change === "number";
  const positive = hasChange ? change >= 0 : true;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        {icon ? (
          <div className="rounded-xl bg-slate-100 p-3">
            {icon}
          </div>
        ) : (
          <div />
        )}

        {hasChange && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              positive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}

            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <h3 className="mt-2 text-3xl font-bold text-slate-900">
          {value}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}