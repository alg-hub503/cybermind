interface TableEmptyProps {
  colSpan: number;
  message?: string;
}

export default function TableEmpty({
  colSpan,
  message = "No data found.",
}: TableEmptyProps) {
  return (
    <tbody>
      <tr>
        <td
          colSpan={colSpan}
          className="px-6 py-12 text-center text-slate-500"
        >
          {message}
        </td>
      </tr>
    </tbody>
  );
}