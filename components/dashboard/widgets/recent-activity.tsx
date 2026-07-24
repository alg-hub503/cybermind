import Card from "@/components/cards/card";

interface RecentActivityProps {
  totalClients: number;
  totalUsers: number;
  totalInvoices: number;
}

export default function RecentActivity({
  totalClients,
  totalUsers,
  totalInvoices,
}: RecentActivityProps) {
  const activities = [
    {
      title: "Clients",
      value: `${totalClients} registered`,
    },
    {
      title: "Users",
      value: `${totalUsers} active`,
    },
    {
      title: "Invoices",
      value: `${totalInvoices} created`,
    },
  ];

  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.title}
            className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{activity.title}</p>

              <p className="text-sm text-slate-500">{activity.value}</p>
            </div>

            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
        ))}
      </div>
    </Card>
  );
}
