"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";
import { ResourceList } from "@/components/ui/resource-list";

interface Class {
  id: string;
  name: string;
  code: string;
  grade?: { name: string };
  academicYear?: { name: string };
}

interface ClassesListProps {
  classes: Class[];
  emptyTitle: string;
  emptyDescription: string;
}

export default function ClassesList({
  classes,
  emptyTitle,
  emptyDescription,
}: ClassesListProps) {
  const { t } = useTranslations("classes");
  const router = useRouter();

  async function handleEdit(cls: Class) {
    const name = prompt(t("editPromptName"), cls.name);
    if (!name) return;

    const code = prompt(t("editPromptCode"), cls.code);
    if (!code) return;

    await fetch(`/api/classes/${cls.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });

    router.refresh();
  }

  async function handleDelete(cls: Class) {
    const ok = confirm(t("confirmDelete"));
    if (!ok) return;

    await fetch(`/api/classes/${cls.id}`, { method: "DELETE" });

    router.refresh();
  }

  return (
    <ResourceList
      items={classes}
      keyField="id"
      renderPrimary={(cls) => cls.name}
      renderMeta={(cls) => {
        const parts: string[] = [cls.code];
        if (cls.grade) parts.push(cls.grade.name);
        if (cls.academicYear) parts.push(cls.academicYear.name);
        return parts.join(" · ");
      }}
      onEdit={handleEdit}
      onDelete={handleDelete}
      emptyState={{
        title: emptyTitle,
        description: emptyDescription,
      }}
    />
  );
}
