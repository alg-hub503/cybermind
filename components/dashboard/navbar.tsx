"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/button";
import UserMenu from "@/components/dashboard/user-menu";
import MobileNavigation from "@/components/dashboard/mobile-navigation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const { t, locale, dir } = useTranslations("navbar");

  const base = locale === "en" ? "/en" : locale === "fr" ? "/fr" : "";
  const titles: Record<string, string> = {
    [`${base}/dashboard`]: t("dashboard"),
    [`${base}/dashboard/users`]: t("users"),
    [`${base}/dashboard/clients`]: t("clients"),
    [`${base}/dashboard/invoices`]: t("invoices"),
    [`${base}/dashboard/schools`]: t("schools"),
    [`${base}/dashboard/analytics`]: t("analytics"),
    [`${base}/dashboard/stats`]: t("stats"),
    [`${base}/dashboard/subscription`]: t("subscription"),
    [`${base}/dashboard/billing`]: t("billing"),
    [`${base}/dashboard/admin`]: t("admin"),
    [`${base}/dashboard/hub`]: t("hub"),
  };

  const title = titles[pathname] ?? t("dashboard");

  return (
    <>
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6" dir={dir}>
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" className="p-2 lg:hidden" aria-label="Open navigation" onClick={() => setIsMobileNavigationOpen(true)}>
            <Menu size={22} />
          </Button>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900 sm:text-xl">{title}</h2>
            <p className="hidden text-sm text-slate-500 sm:block">{t("welcomeBack")}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <LanguageSwitcher currentLang={locale} label={locale === "ar" ? "EN" : "AR"} />

          <Button variant="ghost" aria-label="Notifications" className="hidden p-2 sm:inline-flex">
            <Bell size={20} />
          </Button>

          <UserMenu />
        </div>
      </header>
      <MobileNavigation open={isMobileNavigationOpen} onClose={() => setIsMobileNavigationOpen(false)} />
    </>
  );
}
