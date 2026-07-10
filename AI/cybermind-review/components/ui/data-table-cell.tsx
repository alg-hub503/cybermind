import { ComponentPropsWithoutRef } from "react";

interface DataTableCellProps
  extends ComponentPropsWithoutRef<"td"> {
  children: React.ReactNode;
}

export default function DataTableCell({
  children,
  className = "",
  ...props
}: DataTableCellProps) {
  return (
    <td
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}