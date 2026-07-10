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
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            School Workspace
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {school.name}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Created on{" "}
            <span className="font-medium text-slate-700">
              {school.createdAt.toLocaleDateString()}
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            School ID
          </p>

          <p className="mt-1 font-mono text-sm text-slate-700">
            {school.id}
          </p>
        </div>
      </div>
    </section>
  );
}