"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientForm() {
  const router = useRouter();

  const [name, setName] = useState("");

  async function addClient() {
    if (!name.trim()) return;

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
      }),
    });

    if (res.ok) {
      setName("");
      router.refresh();
    }
  }

  return (
    <div className="flex gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client name"
        className="rounded-xl border px-4 py-2"
      />

      <button
        onClick={addClient}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white"
      >
        Add
      </button>
    </div>
  );
}