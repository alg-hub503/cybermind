interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export default function TableCell({
  children,
  className = "",
}: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-4 text-sm text-slate-700 ${className}`}
    >
      {children}
    </td>
  );
}