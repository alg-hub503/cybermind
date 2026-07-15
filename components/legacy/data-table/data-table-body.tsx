import { ComponentPropsWithoutRef, ReactNode } from "react";

interface DataTableBodyProps
  extends ComponentPropsWithoutRef<"tbody"> {
  children: ReactNode;
}

export default function DataTableBody({
  children,
  className = "",
  ...props
}: DataTableBodyProps) {
  return (
    <tbody
      className={className}
      {...props}
    >
      {children}
    </tbody>
  );
}