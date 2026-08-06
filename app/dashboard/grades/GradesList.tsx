"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";
import { ResourceList } from "@/components/ui/resource-list";

interface Grade {
  id: string;
  name: string;
  order: number;
}

interface GradesListProps {
  grades: Grade[];
  emptyTitle: string;
  emptyDescription: string;
}

export default function GradesList({
  grades,
  emptyTitle,
  emptyDescription,
}: GradesListProps) {
  const { t } = useTranslations("grades");
  const router = useRouter();

  async function handleEdit(grade: Grade) {
    const name = prompt(t("editPromptName"), grade.name);
    if (!name) return;

    const orderStr = prompt(t("editPromptOrder"), String(grade.order));
    const order = parseInt(orderStr ?? "", 10);
    if (isNaN(order) || order < 0) return;

    await fetch(`/api/grades/${grade.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, order }),
    });

    router.refresh();
  }

  async function handleDelete(grade: Grade) {
    const ok = confirm(t("confirmDelete"));
    if (!ok) return;

    await fetch(`/api/grades/${grade.id}`, { method: "DELETE" });

    router.refresh();
  }

  return (
    <ResourceList
      items={grades}
      keyField="id"
      renderPrimary={(grade) => grade.name}
      renderMeta={(grade) => `${t("order")}: ${grade.order}`}
      onEdit={handleEdit}
      onDelete={handleDelete}
      emptyState={{
        title: emptyTitle,
        description: emptyDescription,
      }}
    />
  );
}
