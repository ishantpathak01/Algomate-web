import Link from "next/link";

export type SidebarItem = { label: string; href: string };

export default function Sidebar({
  title,
  items,
}: {
  title: string;
  items: SidebarItem[];
}) {
  return (
    <aside className="border-b border-line p-4 md:min-h-[calc(100vh-4rem)] md:border-b-0 md:border-r">
      <p className="mb-3 px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      <nav aria-label={`${title} navigation`} className="flex gap-1 overflow-x-auto md:block">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-white md:mb-1 md:block"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
