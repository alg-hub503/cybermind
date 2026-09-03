"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t, locale, dir } = useTranslations("verifyEmail");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(token ? "verifying" : "error");
  const [error, setError] = useState(token ? "" : t("invalidToken"));

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/email-change/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? t("error"));
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setError(t("error"));
        setStatus("error");
      }
    }

    verify();
  }, [token, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4" dir={dir}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <div className="mb-4 flex items-center justify-between">
            <div />
            <LanguageSwitcher currentLang={locale} />
          </div>

          {status === "verifying" && (
            <>
              <div className="mb-4 text-4xl">⏳</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("verifying")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("verifying")}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4 text-4xl">✅</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("success")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("successDescription")}</p>
              <Button onClick={() => router.push("/login")} className="mt-6 w-full">
                {t("goToLogin")}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4 text-4xl">❌</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("errorTitle")}</h1>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <Link
                href="/dashboard/profile"
                className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t("backToProfile")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
