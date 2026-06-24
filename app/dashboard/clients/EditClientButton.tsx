"use client";

export default function EditClientButton({
  id,
  currentName,
}: {
  id: string;
  currentName: string;
}) {
  async function handleEdit() {
    const newName = prompt(
      "Enter new client name:",
      currentName
    );

    if (!newName || newName.trim() === "") {
      return;
    }

    const res = await fetch("/api/clients", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        name: newName,
      }),
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("Update failed");
    }
  }

  return (
    <button
      onClick={handleEdit}
      style={{
        background: "orange",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer",
      }}
    >
      Edit
    </button>
  );
}