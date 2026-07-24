"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";

export default function SchoolForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createSchool() {
    if (!name.trim()) {
      toast.error("School name is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Failed to create school");
        return;
      }

      setName("");

      router.refresh();

      toast.success("School created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Create New School
        </h2>

        <p className="text-sm text-slate-500">
          Add a new school to CyberMind.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="School name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <Button
          onClick={createSchool}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size={18} />
              Creating...
            </span>
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </div>
  );
}