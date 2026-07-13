export default function DataTableLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: 5 }).map((_, index) => (
              <th
                key={index}
                className="px-6 py-4"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 8 }).map((_, row) => (
            <tr
              key={row}
              className="border-t border-slate-200"
            >
              {Array.from({ length: 5 }).map((_, cell) => (
                <td
                  key={cell}
                  className="px-6 py-4"
                >
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
