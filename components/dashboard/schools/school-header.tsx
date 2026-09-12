import Image from "next/image";
import { t } from "@/lib/i18n/server";
import EditSchoolButton from "./edit-school-button";
import DeleteSchoolButton from "./delete-school-button";

interface SchoolHeaderProps {
  school: {
    id: string;
    name: string;
    createdAt: Date;
    settings?: {
      logoUrl?: string | null;
      coverUrl?: string | null;
      primaryColor?: string | null;
      secondaryColor?: string | null;
    } | null;
  };
}

export default async function SchoolHeader({
  school,
}: SchoolHeaderProps) {
  const badge = await t("schoolHeader.badge");
  const description = await t("schoolHeader.description");
  const created = await t("schoolHeader.created");
  const schoolIdLabel = await t("schoolHeader.schoolId");

  const primaryColor = school.settings?.primaryColor ?? "#4F46E5";
  const secondaryColor = school.settings?.secondaryColor ?? "#64748B";
  const logoUrl = school.settings?.logoUrl;
  const coverUrl = school.settings?.coverUrl;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {coverUrl && (
        <div className="relative w-full" style={{ aspectRatio: "21/7" }}>
          <Image
            src={coverUrl}
            alt={`${school.name} cover`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt={`${school.name} logo`}
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-2xl object-contain bg-white sm:h-20 sm:w-20"
                  unoptimized
                />
              )}
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${primaryColor}1a`,
                  color: primaryColor,
                }}
              >
                {badge}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              {school.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: secondaryColor }}>
              {description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: secondaryColor }}>
                  {created}
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {school.createdAt.toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: secondaryColor }}>
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
      </div>
    </section>
  );
}