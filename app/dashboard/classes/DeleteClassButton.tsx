"use client";

import { useRouter } from "next/navigation";

export default function DeleteClassButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    const ok = confirm("Delete class? This will also delete all student records under this class.");
    if (!ok) return;

    await fetch(`/api/classes/${id}`, { method: "DELETE" });

    router.refresh();
  }

  return (
    <button onClick={remove} className="rounded-lg bg-red-600 px-3 py-2 text-white">
      Delete
    </button>
  );
}
