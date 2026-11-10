export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xl font-semibold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <path d="M16 3 28 9.5 16 16 4 9.5Z" fill="#c9bcff" />
        <path d="M4 9.5 16 16v13L4 22.5Z" fill="#7c5cf5" />
        <path d="M28 9.5 16 16v13l12-6.5Z" fill="#5b3fd0" />
      </svg>
      <span>Algo<span className="text-brand-soft">Mate</span></span>
    </span>
  );
}
