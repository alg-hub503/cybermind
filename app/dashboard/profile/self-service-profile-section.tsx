"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface TeacherProfileData {
  name: string;
  phone: string;
  specialization: string;
  qualifications: string;
}

interface StaffProfileData {
  name: string;
  phone: string;
  position: string;
  department: string;
}

type ProfileState =
  | { type: "loading" }
  | { type: "none" }
  | { type: "teacher"; data: TeacherProfileData }
  | { type: "staff"; data: StaffProfileData };

interface SelfServiceProfileSectionProps {
  onNameUpdated: (name: string) => void;
}

export default function SelfServiceProfileSection({
  onNameUpdated,
}: SelfServiceProfileSectionProps) {
  const { t, dir } = useTranslations("profile");
  const [state, setState] = useState<ProfileState>({ type: "loading" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then((body) => {
        if (body.type === "teacher") {
          setState({
            type: "teacher",
            data: {
              name: body.profile.user?.name ?? "",
              phone: body.profile.phone ?? "",
              specialization: body.profile.specialization ?? "",
              qualifications: body.profile.qualifications ?? "",
            },
          });
        } else if (body.type === "staff") {
          setState({
            type: "staff",
            data: {
              name: body.profile.user?.name ?? "",
              phone: body.profile.phone ?? "",
              position: body.profile.position ?? "",
              department: body.profile.department ?? "",
            },
          });
        } else {
          setState({ type: "none" });
        }
      })
      .catch(() => setState({ type: "none" }));
  }, []);

  async function handleSave() {
    if (state.type !== "teacher" && state.type !== "staff") return;

    setSaving(true);
    setSaved(false);
    setError(null);

    const payload =
      state.type === "teacher"
        ? {
            name: state.data.name,
            phone: state.data.phone || null,
            specialization: state.data.specialization || null,
            qualifications: state.data.qualifications || null,
          }
        : {
            name: state.data.name,
            phone: state.data.phone || null,
            position: state.data.position || null,
            department: state.data.department || null,
          };

    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? t("error"));
        return;
      }

      onNameUpdated(state.data.name);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (state.type === "loading" || state.type === "none") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir={dir}>
      <h2 className="text-lg font-semibold text-slate-900">{t("myProfile")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("myProfileDescription")}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t("fullName")}</label>
          <input
            value={state.data.name}
            onChange={(e) =>
              setState({ ...state, data: { ...state.data, name: e.target.value } } as ProfileState)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t("phone")}</label>
          <input
            value={state.data.phone}
            onChange={(e) =>
              setState({ ...state, data: { ...state.data, phone: e.target.value } } as ProfileState)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {state.type === "teacher" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("specialization")}</label>
              <input
                value={state.data.specialization}
                onChange={(e) =>
                  setState({ ...state, data: { ...state.data, specialization: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("qualifications")}</label>
              <input
                value={state.data.qualifications}
                onChange={(e) =>
                  setState({ ...state, data: { ...state.data, qualifications: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        {state.type === "staff" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("position")}</label>
              <input
                value={state.data.position}
                onChange={(e) =>
                  setState({ ...state, data: { ...state.data, position: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("department")}</label>
              <input
                value={state.data.department}
                onChange={(e) =>
                  setState({ ...state, data: { ...state.data, department: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !state.data.name.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>

        {saved && (
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">{t("profileSaved")}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
