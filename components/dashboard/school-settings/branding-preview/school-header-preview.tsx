import type { BrandPreviewProps } from "./types";

export default function SchoolHeaderPreview({
  schoolName,
  logoUrl,
  coverUrl,
  primaryColor,
  secondaryColor,
  logoValid,
  coverValid,
  onLogoError,
  onCoverError,
}: BrandPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="relative px-5 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-5"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {logoValid ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-16 w-16 flex-shrink-0 rounded-2xl object-contain ring-4 ring-white/20 sm:h-20 sm:w-20"
              onError={onLogoError}
            />
          ) : (
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white ring-4 ring-white/20 sm:h-20 sm:w-20 sm:text-3xl"
              style={{ backgroundColor: secondaryColor }}
            >
              {schoolName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
              School
            </span>
            <h2 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">
              {schoolName}
            </h2>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-2.5 w-8 rounded-full" style={{ backgroundColor: primaryColor }} title={`Primary: ${primaryColor}`} />
          <span className="h-2.5 w-8 rounded-full" style={{ backgroundColor: secondaryColor }} title={`Secondary: ${secondaryColor}`} />
          <span className="ml-1 text-[10px] font-medium text-white/70">Brand Colors</span>
        </div>
      </div>

      {coverValid ? (
        <div className="relative w-full" style={{ aspectRatio: "21/7" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Cover preview"
            className="absolute inset-0 h-full w-full object-cover"
            onError={onCoverError}
          />
        </div>
      ) : (
        <div className="flex w-full items-center justify-center bg-slate-100 text-sm text-slate-400" style={{ aspectRatio: "21/7" }}>
          Cover image
        </div>
      )}
    </div>
  );
}
