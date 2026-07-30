"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function ForgotPasswordPage() {
  const { t, locale, dir } = useTranslations("forgot");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      toast.success(data.message);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4" dir={dir}>
      <Toaster richColors />
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
              <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
            </div>
            <LanguageSwitcher currentLang={locale} label={locale === "ar" ? "EN" : "AR"} />
          </div>

          {sent ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">{t("sent")}</p>
              <Link
                href="/login"
                className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  {t("email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("loading") : t("submit")}
              </Button>

              <Link
                href="/login"
                className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {t("backToLogin")}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
