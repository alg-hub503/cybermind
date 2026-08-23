import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";

import { cookies } from "next/headers";
import {
  GraduationCap,
  Users,
  FileText,
  CreditCard,
  Shield,
  ArrowRight,
  Check,
  ChevronRight,
  Key,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { translations, type Locale } from "@/lib/i18n/landing";
import { LanguageSwitcher, LangCookieSetter } from "@/app/_components/language-switcher";

async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const lang = store.get("lang")?.value;
  if (lang === "ar" || lang === "en") return lang;
  return "en";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const urlLang = params?.lang;
  const cookieLang = await getLocale();
  const lang: Locale =
    urlLang === "ar" || urlLang === "en" ? urlLang : cookieLang;
  const t = translations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const features = t.features.items;
  const previewItems = t.preview.items;
  const steps = t.howItWorks.steps;
  const securityItems = t.security.items;
  const free = t.pricing.free;
  const pro = t.pricing.pro;

  return (
    <main className="min-h-screen bg-white" dir={dir}>
      {urlLang && <LangCookieSetter lang={urlLang} />}

      {/* ─── Navbar ─── */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#0a0b1e]/95 px-6 backdrop-blur-xl lg:px-12">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Cyber<span className="text-blue-400">Mind</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
          <a href="#features" className="transition hover:text-white">
            {t.nav.features}
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            {t.nav.howItWorks}
          </a>
          <a href="#pricing" className="transition hover:text-white">
            {t.nav.pricing}
          </a>
          <LanguageSwitcher currentLang={lang} label={t.nav.langLabel} />
          <Link
            href="/login"
            className="rounded-xl border border-white/10 px-4 py-2 text-white transition hover:bg-white/5"
          >
            {t.nav.logIn}
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
          >
            {t.nav.startFree}
          </Link>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher currentLang={lang} label={t.nav.langLabel} />
          <a
            href="/register"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {t.nav.startFree}
          </a>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#0a0b1e] pt-36 pb-24 lg:pt-44 lg:pb-32">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[160px]" />
        <div className="absolute right-0 top-40 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center lg:px-12">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            {t.hero.badge}
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl xl:text-7xl">
            {t.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400 lg:text-xl">
            {t.hero.subheadline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-500"
            >
              {t.hero.startFree} <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
            >
              {t.hero.logIn}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="border-t border-gray-100 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {t.features.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500">{t.features.description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const icons = [
                GraduationCap,
                Users,
                Users,
                FileText,
                CreditCard,
                Shield,
              ];
              const Icon = icons[i] || Shield;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-blue-100 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Platform Preview ─── */}
      <section className="border-t border-gray-100 bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {t.preview.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500">{t.preview.description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {previewItems.map((item, i) => {
              const gradients = [
                "from-blue-600 to-indigo-600",
                "from-emerald-500 to-teal-600",
                "from-violet-500 to-purple-600",
                "from-amber-500 to-orange-600",
                "from-rose-500 to-pink-600",
              ];
              const grad = gradients[i % gradients.length];
              const mockupColors = [
                "bg-blue-500",
                "bg-emerald-500",
                "bg-violet-500",
                "bg-amber-500",
                "bg-rose-500",
              ];
              const accent = mockupColors[i % mockupColors.length];
              return (
                <div key={item.title} className="group">
                  <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-[#0a0b1e] shadow-lg transition group-hover:shadow-xl group-hover:-translate-y-1">
                    <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="ml-2 text-xs text-gray-500">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex gap-1 p-4">
                      <div className="flex flex-col gap-1.5 pr-3">
                        <span className="h-2 w-2 rounded-full bg-white/10" />
                        <span className="h-2 w-2 rounded-full bg-white/10" />
                        <span className={`h-2 w-2 rounded-full ${accent}`} />
                        <span className="h-2 w-2 rounded-full bg-white/10" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <div className={`h-16 flex-1 rounded-lg bg-gradient-to-br ${grad} opacity-80`} />
                          <div className="h-16 flex-1 rounded-lg bg-white/5" />
                        </div>
                        <div className="h-3 w-3/4 rounded bg-white/10" />
                        <div className="flex gap-2">
                          <div className="h-3 flex-1 rounded bg-white/5" />
                          <div className="h-3 w-1/4 rounded bg-white/5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how-it-works"
        className="border-t border-gray-100 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {t.howItWorks.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              {t.howItWorks.description}
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-blue-500/30 to-indigo-500/30 md:block" />
            <div className="space-y-12">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className={`relative flex items-start gap-6 ${dir === "rtl" ? "md:pr-16" : "md:pl-16"}`}
                >
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-xl font-bold text-blue-600 ${
                      dir === "rtl" ? "md:absolute md:right-0" : ""
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="pt-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Security & Reliability ─── */}
      <section className="border-t border-gray-100 bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {t.security.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              {t.security.description}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {securityItems.map((item, i) => {
              const icons = [Key, Shield, CreditCard, Globe, Sparkles, Lock];
              const Icon = icons[i] || Shield;
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-blue-100 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="border-t border-gray-100 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {t.pricing.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              {t.pricing.description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">{free.name}</h3>
              <p className="mt-2 text-gray-500">{free.description}</p>
              <p className="mt-6">
                <span className="text-5xl font-black text-gray-900">
                  {free.price}
                </span>
                <span className="text-gray-400"> {free.period}</span>
              </p>
              <ul className="mt-8 space-y-3">
                {free.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Check size={18} className="shrink-0 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                {free.cta} <ChevronRight size={18} />
              </Link>
            </div>

            <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-8 shadow-sm">
              <div className="absolute -top-3 right-6 inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                {pro.badge}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{pro.name}</h3>
              <p className="mt-2 text-gray-500">{pro.description}</p>
              <p className="mt-6">
                <span className="text-5xl font-black text-gray-900">
                  {pro.price}
                </span>
                <span className="text-gray-400"> {pro.period}</span>
              </p>
              <ul className="mt-8 space-y-3">
                {pro.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Check size={18} className="shrink-0 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                {pro.cta} <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-gray-100 bg-[#0a0b1e] py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-lg text-gray-400">{t.cta.description}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-500"
            >
              {t.cta.startFree} <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
            >
              {t.cta.logIn}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 bg-[#0a0b1e] py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="text-lg font-bold text-white">
                Cyber<span className="text-blue-400">Mind</span>
              </span>
              <p className="mt-1 text-sm text-gray-500">{t.footer.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="#features" className="transition hover:text-white">
                {t.footer.features}
              </a>
              <a href="#pricing" className="transition hover:text-white">
                {t.footer.pricing}
              </a>
              <Link href="/privacy" className="transition hover:text-white">
                {t.footer.privacy}
              </Link>
              <Link href="/terms" className="transition hover:text-white">
                {t.footer.terms}
              </Link>
              <Link href="/contact" className="transition hover:text-white">
                {t.footer.contact}
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </div>
        </div>
      </footer>
    </main>
  );
}
