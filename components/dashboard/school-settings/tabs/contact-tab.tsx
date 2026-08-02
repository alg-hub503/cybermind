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

export default function ContactTab({ settings, onSave, saving }: TabProps) {
  const { t } = useTranslations("settings");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");
  const [phone, setPhone] = useState(settings.phone ?? "");
  const [website, setWebsite] = useState(settings.website ?? "");
  const [address, setAddress] = useState(settings.address ?? "");

  async function handleSave() {
    await onSave({
      contactEmail: contactEmail || null,
      phone: phone || null,
      website: website || null,
      address: address || null,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("contact")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("contactDescription")}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("contactEmail")}
            </label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@school.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("phone")}
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 50 000 0000"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("website")}
          </label>
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://school.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("address")}
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder={t("addressPlaceholder")}
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
