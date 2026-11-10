export default function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-40 place-items-center text-sm text-muted">
      {label}
    </div>
  );
}
