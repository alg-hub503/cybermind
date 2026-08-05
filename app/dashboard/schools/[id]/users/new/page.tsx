"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { createSchoolUser } from "@/lib/actions/school-user-actions";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function NewUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const schoolId = params.id;
  const { t } = useTranslations("schoolNewUser");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createSchoolUser({
        schoolId,
        name,
        email,
        password,
        role,
      });

      router.push(`/dashboard/schools/${schoolId}/users`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("failedCreate");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">{t("name")}</label>
          <input
            className="w-full rounded-xl border p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">{t("email")}</label>
          <input
            type="email"
            className="w-full rounded-xl border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">{t("password")}</label>
          <input
            type="password"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">{t("role")}</label>
          <select
            className="w-full rounded-xl border p-3"
            value={role}
            onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
          >
            <option value="USER">{t("roleUser")}</option>
            <option value="ADMIN">{t("roleAdmin")}</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("creating") : t("createUser")}
        </button>
      </form>
    </div>
  );
}
