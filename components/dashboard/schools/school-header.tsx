interface SchoolHeaderProps {
  school: {
    id: string;
    name: string;
    createdAt: Date;
  };
}

export default function SchoolHeader({
  school,
}: SchoolHeaderProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            School Workspace
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            {school.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Manage users, clients, invoices and statistics for this
            school from one centralized workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {school.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                School ID
              </p>

              <p className="mt-1 font-mono text-sm text-slate-700">
                {school.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-64">
          <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">
            Edit School
          </button>

          <button className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100">
            Delete School
          </button>
        </div>
      </div>
    </section>
  );
}