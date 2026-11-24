"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewCard } from "@/components/shared/review-card";
import type { PublicReview } from "@/lib/content";

export function ReviewCarousel({ reviews }: { reviews: PublicReview[] }) {
  const track = useRef<HTMLUListElement>(null);
  const move = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: "smooth" });
  const btn = "grid size-12 place-items-center rounded-full border border-silver bg-white text-royal hover:border-primary";
  return (
    <div>
      <ul ref={track} tabIndex={0} aria-label="Customer reviews" className="flex snap-x snap-mandatory gap-6 overflow-x-auto p-1 pb-4 [scrollbar-width:thin]">
        {reviews.map((r) => <li key={r.id} className={`shrink-0 snap-start basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)] ${reviews.length < 3 ? "mx-auto" : ""}`}><ReviewCard r={r} /></li>)}
      </ul>
      {reviews.length > 3 ? <div className="mt-5 flex justify-center gap-3"><button type="button" aria-label="Previous reviews" className={btn} onClick={() => move(-1)}><ChevronLeft /></button><button type="button" aria-label="Next reviews" className={btn} onClick={() => move(1)}><ChevronRight /></button></div> : null}
    </div>
  );
}
