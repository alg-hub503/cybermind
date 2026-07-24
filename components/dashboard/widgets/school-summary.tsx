import Card from "@/components/cards/card";

interface SchoolSummaryProps {
  schoolName: string;
  totalUsers: number;
  totalClients: number;
  totalInvoices: number;
}

export default function SchoolSummary({
  schoolName,
  totalUsers,
  totalClients,
  totalInvoices,
}: SchoolSummaryProps) {
  return (
    <Card>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {schoolName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            School Overview
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Users
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Clients
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalClients}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Invoices
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalInvoices}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
