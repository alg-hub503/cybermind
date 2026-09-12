import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSchoolAccess, toApiError } from "@/lib/authorization";
import { getSchool } from "@/lib/features/schools/school-actions";

interface SchoolLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  await requireSchoolAccess(id);

  const school = await getSchool(id);
  if (!school) {
    return {};
  }

  return {
    title: school.name,
    icons: school.settings?.faviconUrl
      ? { icon: school.settings.faviconUrl }
      : undefined,
  };
}

export default async function SchoolLayout({
  children,
  params,
}: SchoolLayoutProps) {
  const { id } = await params;

  const access = await requireSchoolAccess(id).catch(toApiError);
  if ("error" in access) {
    notFound();
  }

  return <>{children}</>;
}
