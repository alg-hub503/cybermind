"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button";

interface SubscriptionButtonProps {
  userId: string;
  subscriptionStatus: string;
}

export default function SubscriptionButton({
  userId,
  subscriptionStatus,
}: SubscriptionButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/users/${userId}/subscription`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ?? "Failed to update subscription"
        );
        return;
      }

      toast.success(
        "Subscription updated successfully"
      );

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
        : subscriptionStatus === "PRO"
        ? "Make TRIAL"
        : "Make PRO"}
    </Button>
  );
}