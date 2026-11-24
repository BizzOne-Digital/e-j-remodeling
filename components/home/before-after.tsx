"use client";
import { useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";

export function BeforeAfter({ before, after, title }: { before: string; after: string; title: string }) {
  const [v, setV] = useState(50);
  const tag = "pointer-events-none absolute top-3 rounded-md bg-ink/85 px-3 py-1 text-sm font-semibold text-white";
  return (
    <div className="absolute inset-0 select-none">
      <SmartImage src={after} alt={`${title}, after`} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}><SmartImage src={before} alt={`${title}, before`} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white" style={{ left: `${v}%` }}><span className="grad absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white ring-4 ring-white"><MoveHorizontal size={22} /></span></div>
      <span className={tag + " left-3"}>Before</span><span className={tag + " right-3"}>After</span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 pt-10 font-semibold text-white">{title}</span>
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} aria-label={`Compare before and after: ${title}`} className="absolute inset-0 size-full cursor-ew-resize touch-pan-y opacity-0" />
    </div>
  );
}
