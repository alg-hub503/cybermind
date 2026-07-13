import Card from "@/components/cards/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>

        <h2 className="text-3xl font-bold text-slate-900">{value}</h2>

        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </Card>
  );
}
