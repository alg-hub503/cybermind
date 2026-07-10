import Card from "@/components/cards/card";

interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {value}
        </h2>
      </div>
    </Card>
  );
}