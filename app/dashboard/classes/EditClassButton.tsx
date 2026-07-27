"use client";

import { useRouter } from "next/navigation";

export default function EditClassButton({
  id,
  currentName,
  currentCode,
}: {
  id: string;
  currentName: string;
  currentCode: string;
}) {
  const router = useRouter();

  async function edit() {
    const name = prompt("Class name", currentName);
    if (!name) return;

    const code = prompt("Class code", currentCode);
    if (!code) return;

    await fetch(`/api/classes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });

    router.refresh();
  }

  return (
    <button onClick={edit} className="rounded-lg bg-yellow-500 px-3 py-2 text-white">
      Edit
    </button>
  );
}
