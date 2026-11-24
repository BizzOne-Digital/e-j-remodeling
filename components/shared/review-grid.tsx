"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./review-card";
import { api } from "@/lib/api";
import type { PublicReview } from "@/lib/content";

export function ReviewGrid({ first, more }: { first: PublicReview[]; more: boolean }) {
  const [s, set] = useState({ items: first, more, page: 1, busy: false });
  async function load() {
    set((x) => ({ ...x, busy: true }));
    try {
      const r = await api<{ items: PublicReview[]; hasMore: boolean }>(`/api/testimonials?page=${s.page + 1}`);
      set((x) => ({ items: [...x.items, ...r.items.filter((n) => !x.items.some((o) => o.id === n.id))], more: r.hasMore, page: x.page + 1, busy: false }));
    } catch (e) { toast.error((e as Error).message); set((x) => ({ ...x, busy: false })); }
  }
  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{s.items.map((r) => <li key={r.id}><ReviewCard r={r} /></li>)}</ul>
      {s.more ? <div className="mt-10 text-center"><Button variant="light" size="lg" disabled={s.busy} onClick={load}>{s.busy ? "Loading..." : "Load more reviews"}</Button></div> : null}
    </>
  );
}
