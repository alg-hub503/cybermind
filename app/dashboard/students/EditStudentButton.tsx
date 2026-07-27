"use client";

import { useRouter } from "next/navigation";

export default function EditStudentButton({
  id,
  currentFirstName,
  currentLastName,
  currentCode,
}: {
  id: string;
  currentFirstName: string;
  currentLastName: string;
  currentCode: string;
}) {
  const router = useRouter();

  async function edit() {
    const firstName = prompt("First name", currentFirstName);
    if (!firstName) return;

    const lastName = prompt("Last name", currentLastName);
    if (!lastName) return;

    const code = prompt("Code", currentCode);
    if (!code) return;

    await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, code }),
    });

    router.refresh();
  }

  return (
    <button onClick={edit} className="rounded-lg bg-yellow-500 px-3 py-2 text-white">
      Edit
    </button>
  );
}
