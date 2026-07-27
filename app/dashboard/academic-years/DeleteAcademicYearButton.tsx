"use client";

import { useRouter } from "next/navigation";

export default function DeleteAcademicYearButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function remove() {
    const ok = confirm("Delete academic year?");
    if (!ok) return;

    await fetch(`/api/academic-years/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <button
      onClick={remove}
      className="rounded-lg bg-red-600 px-3 py-2 text-white"
    >
      Delete
    </button>
  );
}
