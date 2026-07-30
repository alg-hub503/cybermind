"use client";

import Link from "next/link";

import Card from "@/components/cards/card";
import Button from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function QuickActions() {
  const { t, dir } = useTranslations("dashboard");

  return (
    <Card dir={dir}>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("quickActions")}</h2>

      <div className="grid gap-3">
        <Link href="/dashboard/clients">
          <Button className="w-full">{t("newClient")}</Button>
        </Link>

        <Link href="/dashboard/invoices">
          <Button variant="secondary" className="w-full">
            {t("newInvoice")}
          </Button>
        </Link>

        <Link href="/dashboard/users">
          <Button variant="outline" className="w-full">
            {t("manageUsers")}
          </Button>
        </Link>

        <Link href="/dashboard/schools">
          <Button variant="ghost" className="w-full">
            {t("schools")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
