"use client";

import UpgradeClient from "@/app/upgrade/upgrade-client";
import { useTranslations } from "@/lib/i18n/use-translations";

interface TrialWarningBannerProps {
  daysLeft: number;
}

export default function TrialWarningBanner({
  daysLeft,
}: TrialWarningBannerProps) {
  const { t, dir } = useTranslations("trial");

  return (
    <div
      dir={dir}
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg
            className="h-5 w-5 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800">
            {t("warningTitle")}
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            {t("warningMessage", { days: daysLeft })}
          </p>
          <div className="mt-3">
            <UpgradeClient />
          </div>
        </div>
      </div>
    </div>
  );
}
