"use client";

export default function DeleteClientButton({
  id,
}: {
  id: string;
}) {
  async function handleDelete() {
    const ok = confirm("Delete this client?");

    if (!ok) return;

    const res = await fetch(
      `/api/clients?id=${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      location.reload();
    } else {
      alert("Delete failed");
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        background: "red",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  );
}