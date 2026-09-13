import type { BrandPreviewProps } from "./types";

export default function DocumentPreview({
  schoolName,
  logoUrl,
  primaryColor,
  logoValid,
  onLogoError,
}: BrandPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-6">
      <div className="mx-auto max-w-[280px] rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          {logoValid ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-8 w-8 rounded-md object-contain"
              onError={onLogoError}
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {schoolName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">{schoolName}</p>
          </div>
        </div>

        <div className="p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Student Report
          </p>

          <div className="mt-4 space-y-1.5 text-left">
            <div className="h-1.5 w-full rounded-full bg-slate-100" />
            <div className="h-1.5 w-5/6 rounded-full bg-slate-100" />
            <div className="h-1.5 w-4/6 rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-2 text-center">
          <p className="truncate text-[10px] text-slate-400">{schoolName}</p>
        </div>
      </div>
    </div>
  );
}
