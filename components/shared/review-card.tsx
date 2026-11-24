import { Star } from "lucide-react";
import { SmartImage } from "./smart-image";
import { cn } from "@/lib/utils";
import type { PublicReview } from "@/lib/content";

export const Stars = ({ n }: { n: number }) => (
  <span role="img" aria-label={`${n} out of 5 stars`} className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={20} aria-hidden className={cn(i <= n ? "fill-primary text-primary" : "text-silver")} />)}</span>
);
export function ReviewCard({ r }: { r: PublicReview }) {
  return (
    <article className="card flex h-full flex-col p-7">
      <Stars n={r.rating} />
      <p className="mt-4 grow whitespace-pre-line leading-relaxed text-[#344054]">{r.message}</p>
      <footer className="mt-6 flex items-center gap-3.5 border-t pt-5">
        {r.image ? <SmartImage src={r.image} alt="" width={48} height={48} fallback="/images/favicon.png" className="size-12 rounded-full object-cover" /> : <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-navy font-serif text-lg font-bold text-white">{r.fullName.charAt(0).toUpperCase()}</span>}
        <div className="min-w-0"><p className="truncate font-bold">{r.fullName}</p><p className="text-sm text-muted">{r.service} · <time dateTime={r.date}>{new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</time></p></div>
      </footer>
    </article>
  );
}
