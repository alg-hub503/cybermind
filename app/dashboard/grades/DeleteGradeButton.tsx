"use client";

import { useRouter } from "next/navigation";

export default function DeleteGradeButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    const ok = confirm("Delete grade? This will also delete all classes and student records under this grade.");
    if (!ok) return;

    await fetch(`/api/grades/${id}`, { method: "DELETE" });

    router.refresh();
  }

  return (
    <button onClick={remove} className="rounded-lg bg-red-600 px-3 py-2 text-white">
      Delete
    </button>
  );
}
