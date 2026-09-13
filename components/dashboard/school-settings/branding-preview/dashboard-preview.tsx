import type { BrandPreviewProps } from "./types";

export default function DashboardPreview({
  schoolName,
  logoUrl,
  primaryColor,
  secondaryColor,
  logoValid,
  onLogoError,
}: BrandPreviewProps) {
  const stats = ["Students", "Teachers", "Classes"];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      <div
        className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3"
      >
        {logoValid ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Logo preview"
            className="h-8 w-8 rounded-lg object-contain"
            onError={onLogoError}
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {schoolName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="truncate text-sm font-semibold text-slate-800">{schoolName}</span>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-500">Welcome back</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {stats.map((label) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-bold" style={{ color: primaryColor }}>
                --
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Recent activity
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: `${secondaryColor}33` }} />
            <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: `${secondaryColor}33` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
