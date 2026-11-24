"use client";
import { ArrowUp } from "lucide-react";
export const BackToTop = () => (
  <button type="button" onClick={() => { window.scrollTo({ top: 0 }); document.getElementById("main")?.focus({ preventScroll: true }); }}
    className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-4 font-semibold text-white hover:border-bright">
    Back to Top <ArrowUp size={16} className="transition-transform group-hover:-translate-y-0.5" aria-hidden />
  </button>
);
