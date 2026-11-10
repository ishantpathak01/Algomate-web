"use client";
import { useEffect, useState } from "react";

const units = [["Days", 86400], ["Hrs", 3600], ["Min", 60], ["Sec", 1]] as const;

/** Counts down to a fixed ISO date, so every visitor sees the same time left. */
export default function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [target]);

  if (left === 0) return <p className="text-sm font-medium text-emerald-400">Started</p>;

  const parts = units.reduce<Array<{ label: string; value: number; unit: number }>>((acc, [label, unit]) => {
    const totalSeconds = left ?? 0;
    const previousTotal = acc.reduce((sum, part) => sum + (part.value * part.unit), 0);
    const value = Math.floor((totalSeconds - previousTotal) / unit);
    return [...acc, { label, value, unit }];
  }, []);

  return (
    <div className="flex gap-2" role="timer" aria-label="Time until contest starts">
      {parts.map(({ label, value }) => (
        <div key={label} className="min-w-12 rounded-lg border border-line px-2 py-1.5 text-center">
          <b className="block text-lg tabular-nums">{left === null ? "--" : String(value).padStart(2, "0")}</b>
          <span className="text-[11px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
