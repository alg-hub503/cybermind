interface CardValueProps {
  value: string | number;
}

export default function CardValue({
  value,
}: CardValueProps) {
  return (
    <h2 className="mt-2 text-3xl font-bold text-slate-900">
      {value}
    </h2>
  );
}