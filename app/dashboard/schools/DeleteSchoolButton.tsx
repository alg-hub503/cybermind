"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";

interface Props {
  id: string;
}

export default function DeleteSchoolButton({
  id,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this school?")) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/schools/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Delete failed");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="danger"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}