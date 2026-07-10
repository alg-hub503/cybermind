import Link from "next/link";

import DeleteSchoolButton from "@/app/dashboard/schools/DeleteSchoolButton";
import EditSchoolButton from "@/app/dashboard/schools/EditSchoolButton";

interface SchoolRowProps {
  school: {
    id: string;
    name: string;
    createdAt: Date;
  };
}

export default function SchoolRow({
  school,
}: SchoolRowProps) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-6 py-4 font-medium">
        <Link
          href={`/dashboard/schools/${school.id}`}
          className="text-blue-600 hover:underline"
        >
          {school.name}
        </Link>
      </td>

      <td className="px-6 py-4 text-slate-500">
        {school.createdAt.toLocaleDateString()}
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <EditSchoolButton
            id={school.id}
            currentName={school.name}
          />

          <DeleteSchoolButton
            id={school.id}
          />
        </div>
      </td>
    </tr>
  );
}