import Link from "next/link";
import Logo from "@/components/ui/Logo";

const cols = [
  { title: "Platform", links: [["Contests", "/#contests"], ["Mentors", "/#mentors"], ["Rewards", "/#rewards"]] },
  { title: "Company", links: [["How it works", "/#how"], ["Become a mentor", "/signup/mentor"], ["Sponsor a contest", "/signup"]] },
  { title: "Contact", links: [["hello@algomate.dev", "mailto:hello@algomate.dev"], ["Privacy", "/#home"], ["Terms", "/#home"]] },
];

export default function Footer() {
  return (
    <footer className="border-t border-line px-5 pb-8 pt-14 text-sm text-muted">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-white" />
          <p className="mt-3 max-w-xs">Contests, mentors and rewards for developers.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-3 font-semibold text-white">{c.title}</h4>
            {c.links.map(([l, h]) => <Link key={l} href={h} className="mb-2 block hover:text-white">{l}</Link>)}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-between gap-2 border-t border-line pt-5">
        <span>© 2026 AlgoMate</span><span>Made for developers, by developers.</span>
      </div>
    </footer>
  );
}
