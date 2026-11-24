import type { Metadata } from "next";
import { PaymentShell } from "@/components/shared/payment-shell";
import { PaymentLookup, PayButton } from "@/components/forms/payment-forms";
import { connectDB, isDbConfigured } from "@/lib/db";
import { getSite } from "@/lib/content";
import { isStripeConfigured } from "@/lib/payments";
import { money, telHref } from "@/lib/utils";
import { Payment } from "@/models";

export const metadata: Metadata = { title: "Secure Payment | E&J Remodeling", robots: { index: false, follow: false } };
export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const [{ token }, { settings: s }] = await Promise.all([searchParams, getSite()]);
  let p = null;
  if (typeof token === "string" && /^[a-f0-9]{48}$/.test(token) && isDbConfigured()) {
    await connectDB();
    p = await Payment.findOne({ token }).select("reference type description customerName amountCents currency status").lean();
  }
  if (!p) return (
    <PaymentShell title="Make a Payment">
      <p className="mb-6 leading-relaxed text-muted">{token ? "That payment link was not recognized. " : ""}Enter the reference from your payment request and the email address it was sent to.</p>
      <PaymentLookup />
    </PaymentShell>
  );
  const payable = ["Unpaid", "Pending", "Failed"].includes(p.status);
  return (
    <PaymentShell title="Review Your Payment">
      <dl className="divide-y">
        {([["Reference", p.reference], ["Customer", p.customerName], ["Payment type", p.type], ["Description", p.description], ["Status", p.status]] as const).filter((r) => r[1]).map(([k, v]) => <div key={k} className="flex justify-between gap-6 py-3.5"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold break-words">{v}</dd></div>)}
        <div className="flex items-center justify-between gap-6 py-5"><dt className="font-semibold">Amount due</dt><dd className="font-btn text-3xl font-extrabold text-royal">{money(p.amountCents, p.currency)}</dd></div>
      </dl>
      {payable ? (isStripeConfigured() ? <PayButton token={token!} /> : <p className="rounded-lg bg-mist p-4">Online payments are not enabled yet. Please call <a className="font-bold text-royal underline" href={telHref(s.phone)}>{s.phone}</a> to arrange payment.</p>) : <p className="rounded-lg bg-mist p-4 font-medium">No payment is due. This request is {p.status.toLowerCase()}.</p>}
      <p className="mt-5 text-sm leading-relaxed text-muted">Payments are completed on Stripe&apos;s secure checkout page. This website never sees or stores your card details.</p>
    </PaymentShell>
  );
}
