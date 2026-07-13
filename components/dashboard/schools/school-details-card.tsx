import Card from "@/components/cards/card";

interface SchoolDetailsCardProps {
  name: string;
  createdAt: Date;
}

export default function SchoolDetailsCard({
  name,
  createdAt,
}: SchoolDetailsCardProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">School Name</p>

          <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
        </div>

        <div>
          <p className="text-sm text-slate-500">Created At</p>

          <p className="mt-1 font-medium text-slate-700">
            {createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
