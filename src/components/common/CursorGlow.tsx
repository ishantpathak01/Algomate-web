"use client";
import { useEffect } from "react";

/** Moves the background glow (--x / --y in globals.css) to follow the cursor, smoothly. */
export default function CursorGlow() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = window.innerWidth / 2, ty = window.innerHeight / 3, x = tx, y = ty, raf = 0;

    const frame = () => {
      const k = reduce ? 1 : 0.14;
      x += (tx - x) * k; y += (ty - y) * k;
      root.style.setProperty("--x", `${x}px`);
      root.style.setProperty("--y", `${y}px`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(frame) : 0;
    };
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(frame); };

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
