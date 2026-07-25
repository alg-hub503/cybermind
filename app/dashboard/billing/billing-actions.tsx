"use client";

import { useState } from "react";

interface BillingActionsProps {
  schoolId: string;
}

export default function BillingActions({ schoolId }: BillingActionsProps) {
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
        setMessage(data.error ?? "Failed to open portal");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setPortalLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
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
        setMessage("Subscription canceled. It will end at the current period.");
        window.location.reload();
      } else {
        setMessage(data.error ?? "Failed to cancel");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">Actions</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {portalLoading ? "Opening..." : "Customer Portal (Manage Payment Methods)"}
        </button>
        <button
          onClick={cancelSubscription}
          disabled={cancelLoading}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelLoading ? "Canceling..." : "Cancel Subscription"}
        </button>
      </div>
      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
