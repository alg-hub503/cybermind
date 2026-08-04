import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authorization";
import { getPlatformSettings } from "@/lib/features/platform/platform-settings-actions";
import { t } from "@/lib/i18n/server";
import PageTitle from "@/components/ui/page-title";
import PlatformSettingsForm from "@/components/dashboard/platform-settings/platform-settings-form";

export default async function PlatformSettingsPage() {
  const access = await requireAdmin().catch(() => null);
  if (!access) {
    redirect("/dashboard");
  }

  const settings = await getPlatformSettings();

  return (
    <div className="space-y-8">
      <PageTitle
        title={await t("platformSettings.title")}
        description={await t("platformSettings.description")}
      />
      <PlatformSettingsForm initialSettings={settings} />
    </div>
  );
}
