"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button";

interface RoleButtonProps {
  userId: string;
  role: string;
}

export default function RoleButton({
  userId,
  role,
}: RoleButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/users/${userId}/role`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ?? "Failed to update role"
        );
        return;
      }

      toast.success("Role updated successfully");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
    >
      {loading
        ? "Updating..."
        : role === "ADMIN"
        ? "Make USER"
        : "Make ADMIN"}
    </Button>
  );
}