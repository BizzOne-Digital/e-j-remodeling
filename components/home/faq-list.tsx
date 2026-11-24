"use client";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/defaults";

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <div className="grid gap-3">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.question} className={cn("rounded-xl border bg-white transition-colors", on && "border-primary")}>
            <h3><button type="button" id={`${id}b${i}`} aria-expanded={on} aria-controls={`${id}p${i}`} onClick={() => setOpen(on ? -1 : i)} className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-semibold sm:px-6">
              {f.question}<Plus size={22} aria-hidden className={cn("shrink-0 text-primary transition-transform duration-300", on && "rotate-45")} />
            </button></h3>
            <div id={`${id}p${i}`} role="region" aria-labelledby={`${id}b${i}`} inert={!on} className={cn("grid transition-[grid-template-rows] duration-300", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden"><p className="whitespace-pre-line px-5 pb-6 leading-relaxed text-[#475467] sm:px-6">{f.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
