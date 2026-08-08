"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t, dir } = useTranslations("verifyEmail");

  const [status, setStatus] = useState<Status>(() => (token ? "verifying" : "error"));
  const [errorMessage, setErrorMessage] = useState(() => (token ? "" : t("invalidToken")));

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch("/api/email-change/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus("success");
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

    verify();
  }, [token, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4" dir={dir}>
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {status === "verifying" && (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-600">{t("verifying")}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-slate-900">{t("success")}</h1>
            <p className="mt-2 text-sm text-slate-600">{t("successDescription")}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              {t("goToLogin")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-slate-900">{t("errorTitle")}</h1>
            <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
            <Link
              href="/dashboard/profile"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              {t("backToProfile")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
