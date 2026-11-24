"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, LazyMotion, MotionConfig, m } from "motion/react";
import { Expand } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import { BeforeAfter } from "./before-after";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/defaults";

const Lightbox = dynamic(() => import("./lightbox"), { ssr: false });
const features = () => import("motion/react").then((x) => x.domAnimation);
const BASE = ["Kitchens", "Bathrooms", "Cabinets", "Showers", "Flooring"];

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [cat, setCat] = useState("All");
  const [at, setAt] = useState<number | null>(null);
  const cats = useMemo(() => { const have = new Set(items.map((i) => i.category)); return ["All", ...BASE.filter((c) => have.has(c)), ...[...have].filter((c) => !BASE.includes(c))]; }, [items]);
  const shown = useMemo(() => items.filter((i) => cat === "All" || i.category === cat), [items, cat]);
  const photos = useMemo(() => shown.filter((i) => !(i.beforeImage && i.afterImage)), [shown]);
  const label = (i: GalleryItem) => (i.kind === "project" ? "Completed project" : "Design inspiration");
  return (
    <>
      <div role="group" aria-label="Filter gallery" className="mb-9 flex flex-wrap justify-center gap-2.5">
        {cats.map((c) => <button key={c} type="button" aria-pressed={c === cat} onClick={() => setCat(c)} className={cn("min-h-11 rounded-full border px-5 font-btn font-semibold transition", c === cat ? "grad border-transparent text-white" : "border-silver bg-white hover:border-primary hover:text-royal")}>{c}</button>)}
      </div>
      <LazyMotion features={features} strict><MotionConfig reducedMotion="user">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-flow-dense lg:auto-rows-[236px] lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((g, i) => {
              const big = cat === "All" && i % 7 === 0, wide = big || (cat === "All" && (i % 7 === 3 || i % 7 === 6));
              const pair = g.beforeImage && g.afterImage;
              return (
                <m.li key={g.image + g.beforeImage + g.title} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}
                  className={cn("relative aspect-[6/5] overflow-hidden rounded-xl bg-navy lg:aspect-auto", (wide || cat !== "All" || pair) && "lg:col-span-2", (big || cat !== "All" || pair) && "lg:row-span-2")}>
                  {pair ? <BeforeAfter before={g.beforeImage} after={g.afterImage} title={g.title} /> : (
                    <button type="button" onClick={() => setAt(photos.indexOf(g))} data-lightbox="" aria-haspopup="dialog" className="group absolute inset-0 text-left">
                      <SmartImage src={g.image} alt="" fill sizes={wide ? "(min-width:1024px) 50vw, (min-width:640px) 50vw, 100vw" : "(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"} className="object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/70 to-transparent p-4 pt-14 text-white">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#8fd0ff]">{label(g)}</span>
                        <span className="mt-1 flex items-end justify-between gap-3 font-semibold">{g.title}<Expand size={18} className="shrink-0" aria-hidden /></span>
                      </span>
                    </button>
                  )}
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </MotionConfig></LazyMotion>
      <p className="mt-6 text-center text-sm text-muted">Images marked “Design inspiration” are for ideas only and do not show completed E&amp;J projects.</p>
      {at !== null ? <Lightbox items={photos} index={at} onIndex={setAt} onClose={() => setAt(null)} label={label} /> : null}
    </>
  );
}
