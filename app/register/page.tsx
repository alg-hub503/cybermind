"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { toast, Toaster } from "sonner";

type Step = "form" | "otp" | "welcome";

interface RegistrationData {
  userId: string;
  schoolId: string;
  schoolName: string;
  phone: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale, dir } = useTranslations("register");

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [regData, setRegData] = useState<RegistrationData | null>(null);
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("error"));
        return;
      }

      setRegData({
        userId: data.userId,
        schoolId: data.schoolId,
        schoolName: data.schoolName,
        phone: data.phone,
        email,
        password,
      });
      setStep("otp");
      if (data.cooldownSeconds) {
        startCooldownTimer(data.cooldownSeconds);
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: regData?.userId,
          code: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("otpError"));
        return;
      }

      // Auto-login after successful verification
      const signInResult = await signIn("credentials", {
        email: regData?.email,
        password: regData?.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Verification succeeded but auto-login failed — go to login
        toast.success(t("verifiedPleaseLogin"));
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      setStep("welcome");
    } catch {
      setError(t("otpError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-phone/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: regData?.userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.cooldownSeconds) {
          startCooldownTimer(data.cooldownSeconds);
        }
        setError(data.error ?? t("otpResendError"));
        return;
      }

      toast.success(t("otpResent"));
    } catch {
      setError(t("otpResendError"));
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

          {/* Step 1: Registration Form */}
          {step === "form" && (
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

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                  {t("phone")}
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("loading") : t("submit")}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                {t("otpSentTo")} <span className="font-medium">{regData?.phone}</span>
              </p>

              <div>
                <label htmlFor="otp" className="mb-1 block text-sm font-medium text-slate-700">
                  {t("otpLabel")}
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder={t("otpPlaceholder")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>

              <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
                {loading ? t("verifying") : t("verify")}
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                className="text-center text-sm text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cooldown > 0
                  ? `${t("resendIn")} ${cooldown}s`
                  : t("resendOtp")}
              </button>
            </form>
          )}

          {/* Step 3: Welcome */}
          {step === "welcome" && regData && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-4xl">🎉</div>
              <h2 className="text-xl font-bold text-slate-900">{t("welcomeTitle")}</h2>
              <p className="text-sm text-slate-600">{t("welcomeMessage")}</p>

              <div className="w-full rounded-xl bg-slate-50 p-4 text-right">
                <div className="mb-2">
                  <span className="text-sm text-slate-500">{t("schoolName")}:</span>
                  <span className="mr-2 font-medium text-slate-900">{regData.schoolName}</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-slate-500">{t("accountNumber")}:</span>
                  <span className="mr-2 font-mono font-bold text-indigo-600">
                    CM-{regData.schoolId.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-slate-500">{t("phoneVerified")}:</span>
                  <span className="mr-2 font-medium text-green-600">✓ {regData.phone}</span>
                </div>
              </div>

              <Button onClick={() => router.push("/dashboard")} className="w-full">
                {t("goToDashboard")}
              </Button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          {step === "form" && (
            <p className="mt-6 text-center text-sm text-slate-500">
              {t("hasAccount")}{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
                {t("login")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
