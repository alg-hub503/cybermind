import { t } from "@/lib/i18n/server";
import PageTitle from "@/components/ui/page-title";
import HubTabs from "@/components/hub/hub-tabs";

export default async function HubPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        title={await t("hub.title")}
        description={await t("hub.description")}
      />
      <HubTabs />
    </div>
  );
}
