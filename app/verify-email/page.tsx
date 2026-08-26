"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const { t, locale, dir } = useTranslations("register");

  const [status, setStatus] = useState<"verifying" | "success" | "already" | "error">("verifying");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldownTimer = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Auto-verify if token is present
  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? t("verificationInvalid"));
          setStatus("error");
          return;
        }

        if (data.alreadyVerified) {
          setStatus("already");
        } else {
          setStatus("success");
        }
      } catch {
        setError(t("verificationInvalid"));
        setStatus("error");
      }
    }

    verify();
  }, [token, t]);

  async function handleResend() {
    setError("");
    try {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();

      if (!meData.user?.id) {
        setError(t("verificationInvalid"));
        return;
      }

      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: meData.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.cooldownSeconds) {
          startCooldownTimer(data.cooldownSeconds);
        }
        setError(data.error ?? t("verificationInvalid"));
        return;
      }

      setError("");
      alert(t("verificationEmailResent"));
    } catch {
      setError(t("verificationInvalid"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4" dir={dir}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <div className="mb-4 flex items-center justify-between">
            <div />
            <LanguageSwitcher currentLang={locale} label={locale === "ar" ? "EN" : "AR"} />
          </div>

          {/* Verifying (with token) */}
          {status === "verifying" && token && (
            <>
              <div className="mb-4 text-4xl">⏳</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("verifying")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("verifyingMessage")}</p>
            </>
          )}

          {/* No token — show resend UI */}
          {status === "verifying" && !token && (
            <>
              <div className="mb-4 text-4xl">📧</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("verifyEmailTitle")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("verifyEmailSubtitle")}</p>

              <Button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="mt-6 w-full"
              >
                {cooldown > 0
                  ? `${t("resendIn")} ${cooldown}s`
                  : t("resendVerification")}
              </Button>

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}

              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t("backToLogin")}
              </Link>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="mb-4 text-4xl">✅</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("emailVerified")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("emailVerifiedMessage")}</p>
              <Button onClick={() => router.push("/login")} className="mt-6 w-full">
                {t("login")}
              </Button>
            </>
          )}

          {/* Already verified */}
          {status === "already" && (
            <>
              <div className="mb-4 text-4xl">ℹ️</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("emailAlreadyVerified")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("emailAlreadyVerifiedMessage")}</p>
              <Button onClick={() => router.push("/login")} className="mt-6 w-full">
                {t("login")}
              </Button>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div className="mb-4 text-4xl">❌</div>
              <h1 className="text-2xl font-bold text-slate-900">{t("verificationFailed")}</h1>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t("backToLogin")}
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
