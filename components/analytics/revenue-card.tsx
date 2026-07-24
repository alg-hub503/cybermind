import StatCard from "@/components/ui/stat-card";

interface RevenueCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function RevenueCard({
  title,
  value,
  subtitle,
}: RevenueCardProps) {
  return (
    <StatCard
      title={title}
      value={value}
      subtitle={subtitle}
    />
  );
}
