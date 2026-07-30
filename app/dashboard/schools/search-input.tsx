"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Props {
  defaultValue?: string;
}

export default function SearchInput({
  defaultValue = "",
}: Props) {
  const { t } = useTranslations("schools");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(defaultValue);

  function handleSearch(newValue: string) {
    setValue(newValue);

    const params = new URLSearchParams(searchParams.toString());

    if (newValue.trim()) {
      params.set("search", newValue);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.push(`/dashboard/schools?${params.toString()}`);
  }

  return (
    <input
      type="text"
      placeholder={t("searchPlaceholder")}
      value={value}
      onChange={(e) => handleSearch(e.target.value)}
      className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-blue-500"
    />
  );
}
