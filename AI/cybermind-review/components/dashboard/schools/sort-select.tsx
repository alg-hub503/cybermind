"use client";

import type { ChangeEvent } from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

interface Props {
  defaultValue?: string;
}

export default function SortSelect({
  defaultValue = "asc",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("sort", event.target.value);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
    >
      <option value="asc">A → Z</option>
      <option value="desc">Z → A</option>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}