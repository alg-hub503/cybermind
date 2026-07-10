import { ReactNode } from "react";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
}

export default function PageSection({
  children,
  className = "",
}: PageSectionProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}