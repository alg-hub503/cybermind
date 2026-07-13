"use client";

import Card from "@/components/cards/card";

interface RevenueChartProps {
  revenue: number;
  invoices: number;
}

export default function RevenueChart({
  revenue,
  invoices,
}: RevenueChartProps) {
  const percentage =
    Math.min((revenue / 10000) * 100, 100);

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Revenue Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current school revenue
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Revenue
            </span>

            <span className="font-semibold text-slate-900">
              ${revenue.toFixed(2)}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Revenue
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              ${revenue.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Invoices
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {invoices}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
