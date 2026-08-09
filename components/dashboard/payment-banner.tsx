"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface PaymentBannerProps {
  schoolId: string;
}

export default function PaymentBanner({ schoolId }: PaymentBannerProps) {
  const { t, dir } = useTranslations("billing");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdatePayment = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error ?? t("failedPortal"));
      }
    } catch {
      setMessage(t("anError"));
    } finally {
      setLoading(false);
    }
  };

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
            {t("pastDueBannerTitle")}
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            {t("pastDueBannerMessage")}
          </p>
          <button
            onClick={handleUpdatePayment}
            disabled={loading}
            className="mt-3 inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("opening") : t("updatePaymentMethod")}
          </button>
          {message && (
            <p className="mt-2 text-sm text-amber-700">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
