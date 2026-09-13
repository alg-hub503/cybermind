import type { BrandPreviewProps } from "./types";

export default function LoginPreview({
  schoolName,
  logoUrl,
  primaryColor,
  logoValid,
  onLogoError,
}: BrandPreviewProps) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-8">
      <div className="w-full max-w-[220px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {logoValid ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-10 w-10 rounded-xl object-contain"
              onError={onLogoError}
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {schoolName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="mt-2 truncate text-sm font-semibold text-slate-800">{schoolName}</p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="rounded-md border border-slate-200 px-2 py-1.5 text-[10px] text-slate-400">
            Email
          </div>
          <div className="rounded-md border border-slate-200 px-2 py-1.5 text-[10px] text-slate-400">
            Password
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-3 w-full rounded-md py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
