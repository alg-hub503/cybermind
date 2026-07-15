import { requireCurrentUser } from "@/lib/require-current-user";
import { redirect } from "next/navigation";
import { countSchools, getSchoolsPaginated } from "@/lib/services/school.service";

import PageHeader from "@/components/dashboard/schools/page-header";
import SchoolRow from "@/components/dashboard/schools/school-row";

import DataTable from "@/components/legacy/data-table/data-table";
import DataTableHead from "@/components/legacy/data-table/data-table-head";
import DataTableBody from "@/components/legacy/data-table/data-table-body";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";
import Pagination from "@/components/ui/pagination";

import SchoolForm from "./SchoolForm";

const PAGE_SIZE = 10;

interface SchoolsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function SchoolsPage({
  searchParams,
}: SchoolsPageProps) {
  const { user } = await requireCurrentUser();

  if (!user.schoolId) {
    redirect("/schools");
  }
  const {
    search = "",
    sort = "asc",
    page = "1",
  } = await searchParams;

  const currentPage = Number(page) || 1;

  const orderBy =
    sort === "desc"
      ? { name: "desc" as const }
      : sort === "newest"
      ? { createdAt: "desc" as const }
      : sort === "oldest"
      ? { createdAt: "asc" as const }
      : { name: "asc" as const };

  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : undefined;

  const totalSchools = await countSchools(where);

  const totalPages = Math.ceil(
    totalSchools / PAGE_SIZE
  );

  const schools = await getSchoolsPaginated(where, orderBy, (currentPage - 1) * PAGE_SIZE, PAGE_SIZE);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Schools"
        description="Manage all schools from one place."
        search={search}
        sort={sort}
      />

      <StatCard
        title="Total Schools"
        value={totalSchools}
      />

      <SchoolForm />

      {schools.length === 0 ? (
        <EmptyState
          title="No schools found"
          description="Create your first school to get started."
        />
      ) : (
        <>
          <DataTable>
            <DataTableHead>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                School
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Created
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                Actions
              </th>
            </DataTableHead>

            <DataTableBody>
              {schools.map((school) => (
                <SchoolRow
                  key={school.id}
                  school={school}
                />
              ))}
            </DataTableBody>
          </DataTable>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/dashboard/schools"
          />
        </>
      )}
    </div>
  );
}






