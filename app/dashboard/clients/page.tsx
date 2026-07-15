import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getClientsBySchool } from "@/lib/services/domain/client.service";

import Card from "@/components/cards/card";

import ClientForm from "./ClientForm";
import EditClientButton from "./EditClientButton";
import DeleteClientButton from "./DeleteClientButton";

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function ClientsPage({
  searchParams,
}: ClientsPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";

const { user } = await requireCurrentUser();

if (!user.schoolId) {
  redirect("/schools");
}

  const clients = await getClientsBySchool(user.schoolId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Clients
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your clients.
        </p>
      </div>

      <Card>
        <p className="text-sm text-slate-500">
          Total Clients
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {clients.length}
        </h2>
      </Card>

      <ClientForm />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Name
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No clients found.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-slate-200"
                >
                  <td className="px-6 py-4">
                    {client.name}
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <EditClientButton
                      id={client.id}
                      currentName={client.name}
                    />

                    <DeleteClientButton
                      id={client.id}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}





