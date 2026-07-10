import { ComponentPropsWithoutRef, ReactNode } from "react";

interface DataTableHeadProps
  extends ComponentPropsWithoutRef<"thead"> {
  children: ReactNode;
}

export default function DataTableHead({
  children,
  className = "",
  ...props
}: DataTableHeadProps) {
  return (
    <thead
      className={`bg-slate-50 ${className}`}
      {...props}
    >
      <tr className="border-b border-slate-200">
        {children}
      </tr>
    </thead>
  );
}