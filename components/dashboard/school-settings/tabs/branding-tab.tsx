"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { SchoolSettings } from "@/lib/features/schools/types/school-settings";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

function isWebUrl(value: string): boolean {
  if (!value) return false;
  if (/^[A-Za-z]:\\/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface TabProps {
  settings: SchoolSettings;
  onSave: (data: Partial<SchoolSettings>) => Promise<void>;
  saving: boolean;
}

export default function BrandingTab({ settings, onSave, saving }: TabProps) {
  const { t } = useTranslations("settings");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(settings.coverUrl ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor ?? "#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor ?? "#64748B");

  const [schoolName, setSchoolName] = useState<string>("School");
  const [logoError, setLogoError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    fetch(`/api/schools/${settings.schoolId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setSchoolName(data.name);
      })
      .catch(() => {});
  }, [settings.schoolId]);

  const logoValid = isWebUrl(logoUrl) && !logoError;
  const coverValid = isWebUrl(coverUrl) && !coverError;

  async function handleSave() {
    await onSave({
      logoUrl: logoUrl || null,
      coverUrl: coverUrl || null,
      faviconUrl: faviconUrl || null,
      primaryColor: primaryColor || null,
      secondaryColor: secondaryColor || null,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("branding")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("brandingDescription")}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("logoUrl")}
          </label>
          <Input
            value={logoUrl}
            onChange={(e) => {
              setLogoUrl(e.target.value);
              setLogoError(false);
            }}
            placeholder="https://example.com/logo.png"
          />
          {logoUrl && !isWebUrl(logoUrl) && (
            <p className="mt-1 text-xs text-amber-600">
              Invalid URL — only https:// links are supported. Local file paths are not supported.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("coverUrl")}
          </label>
          <Input
            value={coverUrl}
            onChange={(e) => {
              setCoverUrl(e.target.value);
              setCoverError(false);
            }}
            placeholder="https://example.com/cover.jpg"
          />
          {coverUrl && !isWebUrl(coverUrl) && (
            <p className="mt-1 text-xs text-amber-600">
              Invalid URL — only https:// links are supported. Local file paths are not supported.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("faviconUrl")}
          </label>
          <Input
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://example.com/favicon.ico"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("primaryColor")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#4F46E5"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("secondaryColor")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#64748B"
              />
            </div>
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="mb-4 text-sm font-medium text-slate-700">Preview</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header band */}
          <div
            className="relative px-5 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-5"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Logo */}
              {logoValid ? (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-16 w-16 flex-shrink-0 rounded-2xl object-contain ring-4 ring-white/20 sm:h-20 sm:w-20"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white ring-4 ring-white/20 sm:h-20 sm:w-20 sm:text-3xl"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {schoolName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name + badge */}
              <div className="flex-1 min-w-0">
                <span
                  className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white"
                >
                  School
                </span>
                <h2 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">
                  {schoolName}
                </h2>
              </div>
            </div>

            {/* Color identity bar */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="h-2.5 w-8 rounded-full"
                style={{ backgroundColor: primaryColor }}
                title={`Primary: ${primaryColor}`}
              />
              <span
                className="h-2.5 w-8 rounded-full"
                style={{ backgroundColor: secondaryColor }}
                title={`Secondary: ${secondaryColor}`}
              />
              <span className="ml-1 text-[10px] font-medium text-white/70">
                Brand Colors
              </span>
            </div>
          </div>

          {/* Cover image */}
          {coverValid ? (
            <div className="relative w-full" style={{ aspectRatio: "21/7" }}>
              <img
                src={coverUrl}
                alt="Cover preview"
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setCoverError(true)}
              />
            </div>
          ) : (
            <div
              className="flex w-full items-center justify-center bg-slate-100 text-sm text-slate-400"
              style={{ aspectRatio: "21/7" }}
            >
              Cover image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
