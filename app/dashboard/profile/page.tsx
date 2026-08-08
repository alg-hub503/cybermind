"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

type Status = "idle" | "submitting" | "verification-sent" | "error";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { t, dir } = useTranslations("profile");

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const currentEmail = session?.user?.email ?? "";

  const handleSubmit = async () => {
    if (!newEmail.trim() || !currentPassword.trim()) return;
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setErrorMessage(t("emailSameAsCurrent"));
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/email-change/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: newEmail.trim().toLowerCase(),
          currentPassword: currentPassword.trim(),
        }),
      });

      if (res.ok) {
        setStatus("verification-sent");
        setNewEmail("");
        setCurrentPassword("");
      } else {
        const data = await res.json();
        setErrorMessage(data.error || t("error"));
        setStatus("error");
      }
    } catch {
      setErrorMessage(t("error"));
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("changeEmail")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("changeEmailDescription")}</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("currentEmail")}</label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("newEmail")}</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("newEmailPlaceholder")}
              disabled={status === "submitting"}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("currentPassword")}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("currentPasswordPlaceholder")}
              disabled={status === "submitting"}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={status === "submitting" || !newEmail.trim() || !currentPassword.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "submitting" ? t("sending") : t("sendVerification")}
          </button>

          {status === "verification-sent" && (
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">{t("verificationSent")}</p>
              <p className="mt-1 text-sm text-emerald-600">{t("verificationSentDescription")}</p>
            </div>
          )}

          {status === "error" && errorMessage && (
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
