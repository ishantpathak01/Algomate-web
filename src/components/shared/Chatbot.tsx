"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

type Msg = { from: "bot" | "me"; text: string; href?: string; cta?: string };

// Simple keyword answers. Swap `reply()` for a call to your own /api/chat route to use a real AI model.
const rules: [RegExp, Omit<Msg, "from">][] = [
  [/coin|reward|redeem|earn/, { text: "Earn coins by solving problems, ranking in contests and keeping streaks. Redeem them for mentor sessions, fee waivers and merch.", href: "/#rewards", cta: "See rewards" }],
  [/mentor|session|book/, { text: "Mentors offer 1:1 mock interviews, code reviews and roadmaps.", href: "/#mentors", cta: "Browse mentors" }],
  [/contest|prize|sponsor|compete/, { text: "Contests are timed rounds with live leaderboards and sponsor prizes.", href: "/#contests", cta: "View contests" }],
  [/login|sign|account|join/, { text: "Sign up is free and takes a minute.", href: "/signup", cta: "Create account" }],
  [/what|algomate|about|how/, { text: "AlgoMate is where you compete in coding contests, learn from mentors and earn coins.", href: "/#how", cta: "How it works" }],
];
const reply = (q: string): Omit<Msg, "from"> =>
  rules.find(([r]) => r.test(q.toLowerCase()))?.[1] ?? { text: "I can help with contests, mentors, coins or signing up. Which one would you like?" };

const quick = ["What is AlgoMate?", "How do coins work?", "Find a mentor"];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Hi! I can explain AlgoMate or point you to the right section. What would you like to know?" }]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, open]);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setText("");
    setTimeout(() => setMsgs((m) => [...m, { from: "bot", ...reply(q) }]), 400);
  };

  return (
    <>
      {open && (
        <div role="dialog" aria-label="AlgoMate assistant" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-50 flex h-[440px] w-[340px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 font-semibold">
            AlgoMate Assistant
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-muted hover:text-white"><Icon name="close" className="size-4" /></button>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${m.from === "me" ? "self-end bg-brand" : "bg-white/5"}`}>
                {m.text}
                {m.href && <a href={m.href} onClick={() => setOpen(false)} className="mt-1 block font-semibold text-brand">{m.cta}</a>}
              </div>
            ))}
            <div ref={end} />
          </div>
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
            {quick.map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-line px-3 py-1 text-xs text-brand hover:border-brand">{q}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex border-t border-line">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question…" aria-label="Message" className="flex-1 bg-transparent px-4 py-3 text-sm outline-none" />
            <button className="px-4 text-sm font-semibold text-brand">Send</button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label="Open chat assistant" className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 grid size-14 place-items-center rounded-full bg-brand transition hover:scale-105">
        <Icon name="chat" className="size-6" />
      </button>
    </>
  );
}
