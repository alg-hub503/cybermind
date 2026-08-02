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

export default function LegalTab({ settings, onSave, saving }: TabProps) {
  const { t } = useTranslations("settings");
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber ?? "");
  const [crNumber, setCrNumber] = useState(settings.crNumber ?? "");
  const [legalNotes, setLegalNotes] = useState(settings.legalNotes ?? "");

  async function handleSave() {
    await onSave({
      taxNumber: taxNumber || null,
      crNumber: crNumber || null,
      legalNotes: legalNotes || null,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("legal")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("legalDescription")}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("taxNumber")}
            </label>
            <Input
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder={t("taxNumberPlaceholder")}
              maxLength={50}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("crNumber")}
            </label>
            <Input
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              placeholder={t("crNumberPlaceholder")}
              maxLength={50}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("legalNotes")}
          </label>
          <textarea
            value={legalNotes}
            onChange={(e) => setLegalNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder={t("legalNotesPlaceholder")}
          />
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
