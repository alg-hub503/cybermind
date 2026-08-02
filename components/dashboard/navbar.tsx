"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

import Button from "@/components/ui/button";
import UserMenu from "@/components/dashboard/user-menu";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function Navbar() {
  const pathname = usePathname();
  const { t, locale, dir } = useTranslations("navbar");

  const titles: Record<string, string> = {
    "/dashboard": t("dashboard"),
    "/dashboard/users": t("users"),
    "/dashboard/clients": t("clients"),
    "/dashboard/invoices": t("invoices"),
    "/dashboard/schools": t("schools"),
    "/dashboard/analytics": t("analytics"),
    "/dashboard/stats": t("stats"),
    "/dashboard/subscription": t("subscription"),
    "/dashboard/billing": t("billing"),
    "/dashboard/admin": t("admin"),
    "/dashboard/hub": t("hub"),
  };

  const title = titles[pathname] ?? t("dashboard");

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6" dir={dir}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{t("welcomeBack")}</p>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher currentLang={locale} label={locale === "ar" ? "EN" : "AR"} />

        <Button variant="ghost" aria-label="Notifications" className="p-2">
          <Bell size={20} />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
