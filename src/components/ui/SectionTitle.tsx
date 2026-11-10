/** Two-line heading: white line, then violet line. */
export default function SectionTitle({ title, accent, sub }: { title: string; accent: string; sub?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
        <span className="block text-brand-soft">{accent}</span>
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-md text-muted">{sub}</p>}
    </div>
  );
}
