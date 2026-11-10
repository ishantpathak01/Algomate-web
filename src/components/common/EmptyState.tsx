export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/[0.02] px-6 py-10 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
