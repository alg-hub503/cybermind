"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/use-translations";

import Input from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";
import RoleButton from "@/components/RoleButton";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

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

  const columns = [
    { key: "email", header: t("email"), width: "30%" },
    { key: "name", header: t("name"), width: "25%" },
    { key: "role", header: t("role"), width: "10%" },
    { key: "subscription", header: t("subscription"), width: "15%" },
    { key: "action", header: t("roleAction"), width: "20%", align: "right" as const },
  ];

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

      <DataTable columns={columns}>
        {filtered.length === 0 ? (
          <DataTableRow>
            <DataTableCell className="p-8">
              <EmptyState
                title={t("noSearchResults")}
                description={t("noSearchResultsDescription")}
              />
            </DataTableCell>
          </DataTableRow>
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
              <DataTableRow key={user.id}>
                <DataTableCell className="text-slate-900">{user.email}</DataTableCell>
                <DataTableCell className="text-slate-600">{user.name || "—"}</DataTableCell>
                <DataTableCell>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadge}`}
                  >
                    {user.role === "ADMIN"
                      ? t("roleAdmin")
                      : t("roleUser")}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}
                  >
                    {statusLabel}
                  </span>
                </DataTableCell>
                <DataTableCell align="right">
                  <div className="flex justify-end">
                    <RoleButton
                      userId={user.id}
                      role={user.role}
                    />
                  </div>
                </DataTableCell>
              </DataTableRow>
            );
          })
        )}
      </DataTable>
    </div>
  );
}
