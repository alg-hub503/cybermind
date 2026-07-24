"use client";

import { useRouter } from "next/navigation";

export default function EditClientButton({
  id,
  currentName,
}: {
  id: string;
  currentName: string;
}) {
  const router = useRouter();

  async function edit() {
    const name = prompt(
      "Client name",
      currentName
    );

    if (!name) return;

    await fetch("/api/clients", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        name,
      }),
    });

    router.refresh();
  }

  return (
    <button
      onClick={edit}
      className="rounded-lg bg-yellow-500 px-3 py-2 text-white"
    >
      Edit
    </button>
  );
}