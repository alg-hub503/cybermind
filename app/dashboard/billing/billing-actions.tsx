"use client";

import { useState } from "react";

import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";

interface BillingActionsProps {
  schoolId: string;
}

export default function BillingActions({ schoolId }: BillingActionsProps) {
  const { t } = useTranslations("billing");

  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openPortal = async () => {
    try {
      setPortalLoading(true);
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
      setPortalLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm(t("cancelConfirm"))) return;
    try {
      setCancelLoading(true);
      setMessage(null);
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(t("canceledMessage"));
        window.location.reload();
      } else {
        setMessage(data.error ?? t("failedCancel"));
      }
    } catch {
      setMessage(t("anError"));
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        {t("actions")}
      </h2>
      <div className="flex flex-wrap gap-3">
        <Button onClick={openPortal} disabled={portalLoading}>
          {portalLoading ? t("opening") : t("openPortal")}
        </Button>
        <Button
          onClick={cancelSubscription}
          disabled={cancelLoading}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
        >
          {cancelLoading ? t("canceling") : t("cancelSubscription")}
        </Button>
      </div>
      {message && (
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      )}
    </div>
  );
}
