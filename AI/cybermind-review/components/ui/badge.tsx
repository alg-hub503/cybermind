interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow";
}

export default function Badge({
  children,
  color = "blue",
}: BadgeProps) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
}