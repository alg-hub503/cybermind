import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getUserById } from "@/lib/features/users/user-actions";
import { t } from "@/lib/i18n/server";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const { id } = await params;

  const { user: currentUser } = await requireCurrentUser();

  const targetUser = await getUserById(id);

  if (!targetUser) {
    notFound();
  }

  if (currentUser.role !== ADMIN_ROLE && targetUser.schoolId !== currentUser.schoolId) {
    notFound();
  }

  const backButton = await t("userDetail.backToUsers");
  const nameLabel = await t("userDetail.name");
  const emailLabel = await t("userDetail.email");
  const roleLabel = await t("userDetail.role");
  const schoolLabel = await t("userDetail.school");
  const userIdLabel = await t("userDetail.userId");

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {backButton}
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{targetUser.name ?? "—"}</h1>
        <p className="text-gray-500">{targetUser.email}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{nameLabel}</label>
            <p className="text-slate-900">{targetUser.name ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{emailLabel}</label>
            <p className="text-slate-900">{targetUser.email}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{roleLabel}</label>
            <p className="text-slate-900">{targetUser.role}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{schoolLabel}</label>
            <p className="text-slate-900">{targetUser.School?.name ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{userIdLabel}</label>
            <p className="font-mono text-sm text-slate-700">{targetUser.id}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
