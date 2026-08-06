"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";
import { ResourceList, Badge } from "@/components/ui/resource-list";

interface AcademicYear {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isCurrent: boolean;
}

interface AcademicYearsListProps {
  academicYears: AcademicYear[];
  emptyTitle: string;
  emptyDescription: string;
}

export default function AcademicYearsList({
  academicYears,
  emptyTitle,
  emptyDescription,
}: AcademicYearsListProps) {
  const { t } = useTranslations("academicYears");
  const router = useRouter();

  async function handleEdit(year: AcademicYear) {
    const name = prompt(t("editPromptName"), year.name);
    if (!name) return;

    await fetch(`/api/academic-years/${year.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    router.refresh();
  }

  async function handleDelete(year: AcademicYear) {
    const ok = confirm(t("confirmDelete"));
    if (!ok) return;

    await fetch(`/api/academic-years/${year.id}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <ResourceList
      items={academicYears}
      keyField="id"
      renderPrimary={(year) => year.name}
      renderMeta={(year) => {
        const start = new Date(year.startDate).toLocaleDateString();
        const end = new Date(year.endDate).toLocaleDateString();
        return `${start} – ${end}`;
      }}
      renderBadge={(year) =>
        year.isCurrent ? <Badge>{t("current")}</Badge> : null
      }
      onEdit={handleEdit}
      onDelete={handleDelete}
      emptyState={{
        title: emptyTitle,
        description: emptyDescription,
      }}
    />
  );
}
