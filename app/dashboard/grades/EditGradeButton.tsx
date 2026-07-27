"use client";

import { useRouter } from "next/navigation";

export default function EditGradeButton({
  id,
  currentName,
  currentOrder,
}: {
  id: string;
  currentName: string;
  currentOrder: number;
}) {
  const router = useRouter();

  async function edit() {
    const name = prompt("Grade name", currentName);
    if (!name) return;

    const orderStr = prompt("Order", String(currentOrder));
    const order = parseInt(orderStr ?? "", 10);
    if (isNaN(order) || order < 0) return;

    await fetch(`/api/grades/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, order }),
    });

    router.refresh();
  }

  return (
    <button onClick={edit} className="rounded-lg bg-yellow-500 px-3 py-2 text-white">
      Edit
    </button>
  );
}
