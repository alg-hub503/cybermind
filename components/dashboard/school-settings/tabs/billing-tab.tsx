"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { SchoolSettings } from "@/lib/features/schools/types/school-settings";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

interface TabProps {
  settings: SchoolSettings;
  onSave: (data: Partial<SchoolSettings>) => Promise<void>;
  saving: boolean;
}

export default function BillingTab({ settings, onSave, saving }: TabProps) {
  const { t } = useTranslations("settings");
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix ?? "INV-");
  const [invoiceNextNum, setInvoiceNextNum] = useState(settings.invoiceNextNum ?? 1);
  const [invoiceNotes, setInvoiceNotes] = useState(settings.invoiceNotes ?? "");
  const [taxRate, setTaxRate] = useState(settings.taxRate?.toString() ?? "");
  const [billingEmail, setBillingEmail] = useState(settings.billingEmail ?? "");

  async function handleSave() {
    await onSave({
      invoicePrefix: invoicePrefix || null,
      invoiceNextNum: invoiceNextNum,
      invoiceNotes: invoiceNotes || null,
      taxRate: taxRate !== "" ? Number(taxRate) : null,
      billingEmail: billingEmail || null,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("billing")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("billingDescription")}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("invoicePrefix")}
            </label>
            <Input
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="INV-"
              maxLength={10}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("invoiceNextNum")}
            </label>
            <Input
              type="number"
              value={invoiceNextNum}
              onChange={(e) => setInvoiceNextNum(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("invoiceNotes")}
          </label>
          <textarea
            value={invoiceNotes}
            onChange={(e) => setInvoiceNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder={t("invoiceNotesPlaceholder")}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("taxAndBilling")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("taxAndBillingDescription")}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("taxRate")}
            </label>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="15"
              min={0}
              max={100}
              step={0.01}
            />
            <p className="mt-1 text-xs text-slate-500">{t("taxRateHint")}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("billingEmail")}
            </label>
            <Input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="billing@school.com"
            />
            <p className="mt-1 text-xs text-slate-500">{t("billingEmailHint")}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Spinner size={16} /> {t("saving")}
            </span>
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </div>
  );
}
