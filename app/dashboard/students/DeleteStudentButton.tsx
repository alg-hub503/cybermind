"use client";

import { useRouter } from "next/navigation";

export default function DeleteStudentButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    const ok = confirm("Delete student? This will also delete all academic records for this student.");
    if (!ok) return;

    await fetch(`/api/students/${id}`, { method: "DELETE" });

    router.refresh();
  }

  return (
    <button onClick={remove} className="rounded-lg bg-red-600 px-3 py-2 text-white">
      Delete
    </button>
  );
}
