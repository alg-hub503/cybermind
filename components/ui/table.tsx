import { ReactNode } from "react";
import clsx from "clsx";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export default function Table({
  children,
  className,
}: TableProps) {
  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  );
}