import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStaffMember } from "@/lib/features/staff/staff-actions";
import { t } from "@/lib/i18n/server";

interface StaffPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffDetailPage({
  params,
}: StaffPageProps) {
  const { id } = await params;

  const { user } = await requireCurrentUser();

  const staff = await getStaffMember(id);

  if (!staff) {
    notFound();
  }

  if (user.role !== ADMIN_ROLE && staff.schoolId !== user.schoolId) {
    notFound();
  }

  const backButton = await t("staff.backToList");
  const nameLabel = await t("staff.name");
  const emailLabel = await t("staff.email");
  const phoneLabel = await t("staff.phone");
  const positionLabel = await t("staff.position");
  const departmentLabel = await t("staff.department");
  const hireDateLabel = await t("staff.hireDate");
  const statusLabel = await t("staff.status");
  const activeLabel = await t("staff.active");
  const inactiveLabel = await t("staff.inactive");

  const hireDate = staff.hireDate
    ? new Date(staff.hireDate).toLocaleDateString()
    : "—";

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {backButton}
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{staff.user.name ?? "—"}</h1>
        <p className="text-gray-500">{staff.user.email}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{nameLabel}</label>
            <p className="text-slate-900">{staff.user.name ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{emailLabel}</label>
            <p className="text-slate-900">{staff.user.email}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{phoneLabel}</label>
            <p className="text-slate-900">{staff.phone ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{positionLabel}</label>
            <p className="text-slate-900">{staff.position ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{departmentLabel}</label>
            <p className="text-slate-900">{staff.department ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{hireDateLabel}</label>
            <p className="text-slate-900">{hireDate}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{statusLabel}</label>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              staff.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {staff.status === "ACTIVE" ? activeLabel : inactiveLabel}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
