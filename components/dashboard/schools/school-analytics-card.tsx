import Link from "next/link";
import { BarChart3 } from "lucide-react";

import Card from "@/components/cards/card";

interface SchoolAnalyticsCardProps {
  schoolId: string;
}

export default function SchoolAnalyticsCard({
  schoolId,
}: SchoolAnalyticsCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View school performance and statistics.
          </p>
        </div>

        <BarChart3
          size={32}
          className="text-indigo-600"
        />
      </div>

      <Link
        href={`/dashboard/schools/${schoolId}/analytics`}
        className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Open Analytics
      </Link>
    </Card>
  );
}
