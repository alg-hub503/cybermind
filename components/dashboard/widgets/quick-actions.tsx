import Link from "next/link";

import Card from "@/components/cards/card";
import Button from "@/components/ui/button";

export default function QuickActions() {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Quick Actions
      </h2>

      <div className="grid gap-3">
        <Link href="/dashboard/clients/new">
          <Button className="w-full">New Client</Button>
        </Link>

        <Link href="/dashboard/invoices/new">
          <Button variant="secondary" className="w-full">
            New Invoice
          </Button>
        </Link>

        <Link href="/dashboard/users">
          <Button variant="outline" className="w-full">
            Manage Users
          </Button>
        </Link>

        <Link href="/dashboard/schools">
          <Button variant="ghost" className="w-full">
            Schools
          </Button>
        </Link>
      </div>
    </Card>
  );
}
