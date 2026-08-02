import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getSchool } from "@/lib/features/schools/school-actions";
import { getSchoolSettings } from "@/lib/features/schools/school-settings-actions";
import PageTitle from "@/components/ui/page-title";
import SchoolSettingsForm from "@/components/dashboard/school-settings/school-settings-form";

export default async function SchoolSettingsPage() {
  const { user } = await requireCurrentUser();

  if (!user.schoolId) {
    redirect("/dashboard");
  }

  const school = await getSchool(user.schoolId);
  if (!school) {
    redirect("/dashboard");
  }

  const settings = await getSchoolSettings(user.schoolId);

  return (
    <div className="space-y-8">
      <PageTitle
        title={`School Settings — ${school.name}`}
        description="Manage your school configuration, branding, and preferences."
      />
      <SchoolSettingsForm
        schoolId={user.schoolId}
        initialSettings={settings}
      />
    </div>
  );
}
