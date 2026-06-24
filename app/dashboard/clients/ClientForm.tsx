"use client";

import { useState } from "react";

export default function ClientForm() {
  const [name, setName] = useState("");

  async function addClient() {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        schoolId: "cmqmom2es000230ejfy6su2db",
      }),
    });

    if (res.ok) {
      alert("Client added");
      location.reload();
    } else {
      alert("Failed");
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client name"
      />

      <button
        onClick={addClient}
        style={{ marginLeft: 10 }}
      >
        Add Client
      </button>
    </div>
  );
}