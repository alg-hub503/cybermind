import { ReactNode } from "react";

interface TableHeaderProps {
  children: ReactNode;
}

export default function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <thead className="bg-slate-50">
      <tr className="border-b border-slate-200">
        {children}
      </tr>
    </thead>
  );
}