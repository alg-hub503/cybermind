"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  defaultValue?: string;
}

export default function SortSelect({
  defaultValue = "asc",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", value);
    params.set("page", "1");

    router.push(`/dashboard/schools?${params.toString()}`);
  }

  return (
    <select
      value={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-blue-500"
    >
      <option value="asc">A → Z</option>
      <option value="desc">Z → A</option>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}