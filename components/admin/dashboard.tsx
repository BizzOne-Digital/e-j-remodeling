"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Title } from "./shell";
import { api } from "@/lib/api";
import { formatDate, money } from "@/lib/utils";

type Data = { stats: Record<"bookings" | "pendingBookings" | "confirmedBookings" | "inquiries" | "unread" | "approved" | "pendingReviews" | "paidCents" | "paidCount", number>; activity: { kind: string; href: string; text: string; status: string; at: string }[]; config: { stripe: boolean; stripeLive: boolean; mail: boolean } };
export function Dashboard() {
  const [d, set] = useState<Data | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<Data>("/api/admin/stats").then(set, (e) => setError(e.message)); }, []);
  if (error) return <p role="alert" className="card p-6 text-red-700">{error}</p>;
  const s = d?.stats;
  const cards = [["Total Bookings", s?.bookings, "bookings"], ["Pending Bookings", s?.pendingBookings, "bookings"], ["Confirmed Bookings", s?.confirmedBookings, "bookings"], ["Contact Inquiries", s && `${s.inquiries}`, "inquiries", s && `${s.unread} unread`], ["Approved Reviews", s?.approved, "testimonials"], ["Pending Reviews", s?.pendingReviews, "testimonials"], ["Total Payments", s && money(s.paidCents), "payments", s && `${s.paidCount} paid, net of refunds`]] as const;
  return (
    <>
      <Title text="Live totals from your database.">Dashboard</Title>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, v, href, sub]) => <li key={label}><Link href={`/admin/${href}`} className="card block h-full p-5 transition hover:border-primary"><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-3xl font-bold">{v ?? <span className="block h-9 w-16 animate-pulse rounded bg-line" />}</p>{sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}</Link></li>)}
      </ul>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.700fr_1fr]">
        <section className="card min-w-0 p-5 sm:p-6"><h2 className="mb-3 font-sans text-lg font-bold tracking-normal">Recent activity</h2>
          {d && !d.activity.length ? <p className="text-muted">Bookings, inquiries, reviews, and payments will appear here.</p> : null}
          <ul className="divide-y">{d?.activity.map((a, i) => <li key={i}><Link href={a.href} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-royal"><span className="min-w-0 max-w-full truncate"><strong>{a.kind}</strong> · {a.text}</span><span className="flex items-center gap-3 text-sm text-muted">{formatDate(a.at)}<Badge>{a.status}</Badge></span></Link></li>)}</ul>
        </section>
        <section className="card p-5 sm:p-6"><h2 className="mb-3 font-sans text-lg font-bold tracking-normal">Connections</h2>
          {d ? <ul className="grid gap-3">
            <li><strong>Online payments:</strong> {d.config.stripe ? (d.config.stripeLive ? "Live" : "Test mode") : "Awaiting Stripe keys"}</li>
            <li><strong>Email notifications:</strong> {d.config.mail ? "Configured" : "Awaiting SMTP details. Submissions are still saved here."}</li>
          </ul> : null}
        </section>
      </div>
    </>
  );
}
