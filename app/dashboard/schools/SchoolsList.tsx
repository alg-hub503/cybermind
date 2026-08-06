"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";
import { ResourceList } from "@/components/ui/resource-list";

interface School {
  id: string;
  name: string;
}

interface SchoolsListProps {
  schools: School[];
  isAdmin: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

export default function SchoolsList({
  schools,
  isAdmin,
  emptyTitle,
  emptyDescription,
}: SchoolsListProps) {
  const { t } = useTranslations("schools");
  const router = useRouter();

  async function handleEdit(school: School) {
    const name = prompt(t("editPrompt"), school.name);
    if (!name || name.trim() === "") return;

    const response = await fetch(`/api/schools/${school.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  async function handleDelete(school: School) {
    const ok = confirm(t("confirmDelete"));
    if (!ok) return;

    await fetch(`/api/schools/${school.id}`, { method: "DELETE" });

    router.refresh();
  }

  return (
    <ResourceList
      items={schools}
      keyField="id"
      renderPrimary={(school) => (
        <Link
          href={`/dashboard/schools/${school.id}`}
          className="truncate text-indigo-600 hover:underline"
        >
          {school.name}
        </Link>
      )}
      onEdit={isAdmin ? handleEdit : undefined}
      onDelete={isAdmin ? handleDelete : undefined}
      emptyState={{
        title: emptyTitle,
        description: emptyDescription,
      }}
    />
  );
}
