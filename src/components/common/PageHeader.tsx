export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="text-sm font-medium uppercase tracking-wide text-brand-soft">{eyebrow}</p>}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
    </header>
  );
}
