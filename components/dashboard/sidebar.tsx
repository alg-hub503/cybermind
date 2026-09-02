"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  CreditCard,
  Shield,
  Crown,
  CalendarDays,
  Layers,
  BookOpen,
  LogOut,
  HelpCircle,
  Settings,
} from "lucide-react";

import NavItem from "./nav-item";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function Sidebar() {
  const { data: session } = useSession();
  const { t, locale, dir } = useTranslations("sidebar");

  const isAdmin = session?.user?.role === "ADMIN";
  const schoolId = session?.user?.schoolId;
  const base = locale === "en" ? "/en" : "";

  return (
    <aside
      className={`fixed inset-y-0 z-40 hidden w-64 flex-col border-slate-800 bg-slate-900 lg:flex ${
        dir === "rtl" ? "border-l" : "border-r"
      }`}
      dir={dir}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Cyber<span className="text-blue-500">Mind</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">{t("tagline")}</p>
        </div>
        <LanguageSwitcher currentLang={locale} label={locale === "ar" ? "EN" : "AR"} />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        <NavItem href={`${base}/dashboard`} label={t("dashboard")} icon={<LayoutDashboard size={20} />} />
        <NavItem href={`${base}/dashboard/clients`} label={t("clients")} icon={<Users size={20} />} />
        <NavItem href={`${base}/dashboard/invoices`} label={t("invoices")} icon={<FileText size={20} />} />
        <NavItem href={`${base}/dashboard/schools`} label={t("schools")} icon={<GraduationCap size={20} />} />
        <NavItem href={`${base}/dashboard/academic-years`} label={t("academicYears")} icon={<CalendarDays size={20} />} />
        <NavItem href={`${base}/dashboard/grades`} label={t("grades")} icon={<Layers size={20} />} />
        <NavItem href={`${base}/dashboard/classes`} label={t("classes")} icon={<BookOpen size={20} />} />
        <NavItem href={`${base}/dashboard/students`} label={t("students")} icon={<GraduationCap size={20} />} />
        <NavItem href={`${base}/dashboard/teachers`} label={t("teachers")} icon={<Users size={20} />} />
        <NavItem href={`${base}/dashboard/staff`} label={t("staff")} icon={<Users size={20} />} />
        <NavItem href={`${base}/dashboard/stats`} label={t("stats")} icon={<BarChart3 size={20} />} />
        <NavItem href={`${base}/dashboard/subscription`} label={t("subscription")} icon={<Crown size={20} />} />
        <NavItem href={`${base}/dashboard/billing`} label={t("billing")} icon={<CreditCard size={20} />} />
        <NavItem href={`${base}/dashboard/hub`} label={t("hub")} icon={<HelpCircle size={20} />} />
        {!isAdmin && schoolId && (
          <NavItem href={`${base}/dashboard/schools/${schoolId}/settings`} label={t("settings")} icon={<Settings size={20} />} />
        )}
        {isAdmin && (
          <>
            <NavItem href={`${base}/dashboard/admin`} label={t("admin")} icon={<Shield size={20} />} />
            <NavItem href={`${base}/dashboard/roles`} label={t("roles")} icon={<Shield size={20} />} />
            <NavItem href={`${base}/dashboard/platform-settings`} label={t("platformSettings")} icon={<Settings size={20} />} />
          </>
        )}
      </nav>

      <div className="border-t border-slate-800 p-6">
        <div className="space-y-1">
          <p className="font-semibold text-white">
            {session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "User"}
          </p>
          <p className="text-sm text-slate-400">{session?.user?.email}</p>
          <span className="inline-flex rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
            {session?.user?.role}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: locale === "en" ? "/en/login" : "/login" })}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={16} />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
