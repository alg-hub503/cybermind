interface CardTitleProps {
  title: string;
  description?: string;
}

export default function CardTitle({
  title,
  description,
}: CardTitleProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-slate-900">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}