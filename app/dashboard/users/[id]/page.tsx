import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import PageTitle from "@/components/ui/page-title";

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserPage({
  params,
}: UserPageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="User Details"
        description="View user information."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <p>
            <strong>Name:</strong>{" "}
            {user.name ?? "No name"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {user.role}
          </p>

          <p>
            <strong>Subscription:</strong>{" "}
            {user.subscriptionStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
