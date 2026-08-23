import { t } from "@/lib/i18n/server";
import EditSchoolButton from "./edit-school-button";
import DeleteSchoolButton from "./delete-school-button";

interface SchoolHeaderProps {
  school: {
    id: string;
    name: string;
    createdAt: Date;
  };
}

export default async function SchoolHeader({
  school,
}: SchoolHeaderProps) {
  const badge = await t("schoolHeader.badge");
  const description = await t("schoolHeader.description");
  const created = await t("schoolHeader.created");
  const schoolIdLabel = await t("schoolHeader.schoolId");

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            {badge}
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            {school.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {created}
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {school.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {schoolIdLabel}
              </p>

              <p className="mt-1 font-mono text-sm text-slate-700">
                {school.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-64">
          <EditSchoolButton id={school.id} currentName={school.name} />
          <DeleteSchoolButton id={school.id} schoolName={school.name} />
        </div>
      </div>
    </section>
  );
}