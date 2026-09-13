"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface AvatarSectionProps {
  fallbackInitial: string;
}

export default function AvatarSection({ fallbackInitial }: AvatarSectionProps) {
  const { t, dir } = useTranslations("profile");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/avatar")
      .then((r) => r.json())
      .then((body) => setAvatarUrl(body.avatarUrl ?? ""))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/me/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatarUrl.trim() || null }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? t("error"));
        return;
      }

      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const showImage = avatarUrl.trim() !== "" && !imgError;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir={dir}>
      <h2 className="text-lg font-semibold text-slate-900">{t("avatar")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("avatarDescription")}</p>

      <div className="mt-6 flex items-center gap-4">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Avatar preview"
            className="h-16 w-16 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white">
            {fallbackInitial}
          </div>
        )}

        <div className="flex-1">
          <input
            value={avatarUrl}
            onChange={(e) => {
              setAvatarUrl(e.target.value);
              setImgError(false);
            }}
            placeholder="https://example.com/avatar.png"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>

      {saved && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">{t("profileSaved")}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
