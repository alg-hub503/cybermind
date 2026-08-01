"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/use-translations";

import Input from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";
import RoleButton from "@/components/RoleButton";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionStatus: string | null;
}

interface AdminUsersTableProps {
  users: AdminUser[];
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-indigo-100 text-indigo-700",
  USER: "bg-slate-100 text-slate-700",
};

const STATUS_BADGE: Record<string, string> = {
  TRIALING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-red-100 text-red-700",
};

export default function AdminUsersTable({
  users,
}: AdminUsersTableProps) {
  const { t, dir } = useTranslations("admin");

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(q) ||
        user.name.toLowerCase().includes(q)
    );
  }, [users, query]);

  if (users.length === 0) {
    return (
      <EmptyState
        title={t("noUsers")}
        description={t("noUsersDescription")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="max-w-sm"
        dir={dir}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                <th className="p-4 font-medium">{t("email")}</th>
                <th className="p-4 font-medium">{t("name")}</th>
                <th className="p-4 font-medium">{t("role")}</th>
                <th className="p-4 font-medium">{t("subscription")}</th>
                <th className="p-4 text-right font-medium">
                  {t("roleAction")}
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8">
                    <EmptyState
                      title={t("noSearchResults")}
                      description={t("noSearchResultsDescription")}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const roleBadge =
                    ROLE_BADGE[user.role] ?? "bg-slate-100 text-slate-700";
                  const statusBadge =
                    STATUS_BADGE[user.subscriptionStatus ?? ""] ??
                    "bg-slate-100 text-slate-600";

                  const statusLabel = user.subscriptionStatus
                    ? user.subscriptionStatus === "TRIALING"
                      ? t("statusTrialing")
                      : user.subscriptionStatus === "ACTIVE"
                        ? t("statusActive")
                        : user.subscriptionStatus === "CANCELED"
                          ? t("statusCanceled")
                          : t("statusOther")
                    : t("noSubscription");

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="p-4 text-sm text-slate-900">
                        {user.email}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {user.name || "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadge}`}
                        >
                          {user.role === "ADMIN"
                            ? t("roleAdmin")
                            : t("roleUser")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="flex justify-end p-4">
                        <RoleButton
                          userId={user.id}
                          role={user.role}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
