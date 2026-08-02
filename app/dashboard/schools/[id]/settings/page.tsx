import { notFound } from "next/navigation";
import { requireSchoolAccess, toApiError } from "@/lib/authorization";
import { getSchool } from "@/lib/features/schools/school-actions";
import { getSchoolSettings } from "@/lib/features/schools/school-settings-actions";
import PageTitle from "@/components/ui/page-title";
import SchoolSettingsForm from "@/components/dashboard/school-settings/school-settings-form";

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolSettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;

  const access = await requireSchoolAccess(id).catch(toApiError);
  if ("error" in access) {
    notFound();
  }

  const school = await getSchool(id);
  if (!school) {
    notFound();
  }

  const settings = await getSchoolSettings(id);

  return (
    <div className="space-y-8">
      <PageTitle
        title={school.name}
        description="Manage school settings, branding, and preferences."
      />
      <SchoolSettingsForm
        schoolId={id}
        initialSettings={settings}
      />
    </div>
  );
}
