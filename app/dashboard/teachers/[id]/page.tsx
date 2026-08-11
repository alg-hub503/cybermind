import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getTeacher } from "@/lib/features/teachers/teacher-actions";
import { t } from "@/lib/i18n/server";

interface TeacherPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherDetailPage({
  params,
}: TeacherPageProps) {
  const { id } = await params;

  const { user } = await requireCurrentUser();

  const teacher = await getTeacher(id);

  if (!teacher) {
    notFound();
  }

  if (user.role !== ADMIN_ROLE && teacher.schoolId !== user.schoolId) {
    notFound();
  }

  const backButton = await t("teachers.backToList");
  const nameLabel = await t("teachers.name");
  const emailLabel = await t("teachers.email");
  const phoneLabel = await t("teachers.phone");
  const specializationLabel = await t("teachers.specialization");
  const qualificationsLabel = await t("teachers.qualifications");
  const hireDateLabel = await t("teachers.hireDate");
  const statusLabel = await t("teachers.status");
  const activeLabel = await t("teachers.active");
  const inactiveLabel = await t("teachers.inactive");

  const hireDate = teacher.hireDate
    ? new Date(teacher.hireDate).toLocaleDateString()
    : "—";

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/teachers"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {backButton}
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{teacher.user.name ?? "—"}</h1>
        <p className="text-gray-500">{teacher.user.email}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{nameLabel}</label>
            <p className="text-slate-900">{teacher.user.name ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{emailLabel}</label>
            <p className="text-slate-900">{teacher.user.email}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{phoneLabel}</label>
            <p className="text-slate-900">{teacher.phone ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{specializationLabel}</label>
            <p className="text-slate-900">{teacher.specialization ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{qualificationsLabel}</label>
            <p className="text-slate-900">{teacher.qualifications ?? "—"}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{hireDateLabel}</label>
            <p className="text-slate-900">{hireDate}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">{statusLabel}</label>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              teacher.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {teacher.status === "ACTIVE" ? activeLabel : inactiveLabel}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
