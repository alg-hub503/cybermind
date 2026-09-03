"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { toast, Toaster } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale, dir } = useTranslations("register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("error"));
        return;
      }

      toast.success(t("success"));
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError(t("error"));
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
            <LanguageSwitcher currentLang={locale} />
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                {t("name")}
              </label>
              <Input
                id="name"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                {t("password")}
              </label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("loading") : t("submit")}
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            {t("hasAccount")}{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
