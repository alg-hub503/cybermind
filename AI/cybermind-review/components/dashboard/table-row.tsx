interface TableRowProps {
  children: React.ReactNode;
}

export default function TableRow({
  children,
}: TableRowProps) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      {children}
    </tr>
  );
}