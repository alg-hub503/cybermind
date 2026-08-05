import { t } from "@/lib/i18n/server";
import Card from "@/components/cards/card";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface SchoolClientsProps {
  clients: Client[];
}

export default async function SchoolClients({
  clients,
}: SchoolClientsProps) {
  const title = await t("schoolClientsCard.title");
  const description = await t("schoolClientsCard.description");
  const emptyTitle = await t("schoolClientsCard.emptyTitle");
  const emptyDescription = await t("schoolClientsCard.emptyDescription");
  const clientIdLabel = await t("schoolClientsCard.clientId");

  return (
    <Card className="rounded-2xl border border-slate-200 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          <Building2 size={22} />
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
          <Building2
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />

          <p className="font-medium text-slate-600">
            {emptyTitle}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                  {index + 1}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {client.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {clientIdLabel}
                  </p>
                </div>
              </div>

              <ArrowRight
                size={18}
                className="text-slate-400"
              />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
