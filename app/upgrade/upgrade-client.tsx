"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function UpgradeClient({ label }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations("upgrade");

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = loading ? t("loading") : (label ?? t("upgradeNow"));

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
    >
      {buttonText}
    </button>
  );
}
