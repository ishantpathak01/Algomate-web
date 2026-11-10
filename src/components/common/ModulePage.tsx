import PageHeader from "./PageHeader";

export default function ModulePage({
  title,
  description,
  area,
}: {
  title: string;
  description: string;
  area: string;
}) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-5 py-10 md:px-8">
      <PageHeader eyebrow={area} title={title} description={description} />
      <section className="rounded-2xl border border-line bg-card p-5 sm:p-7">
        <p className="text-sm font-semibold">Backend integration point</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          This module is ready for its feature service and API data. Authentication, permissions,
          persistence, and trusted server-side actions must be provided by the configured backend
          before this area can manage live accounts or platform data.
        </p>
      </section>
    </main>
  );
}
