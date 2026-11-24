import { requireAdmin } from "@/lib/auth";
import { filterFrom, resources } from "@/lib/admin-resources";
import { handler } from "@/lib/http";
import { Payment } from "@/models";

/** Quotes a CSV cell and neutralises spreadsheet formulas. */
const cell = (v: unknown) => { const s = String(v ?? ""); return `"${(/^[=+\-@\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`; };
export const GET = handler(async (req) => {
  await requireAdmin();
  const rows = await Payment.find(filterFrom(resources.payments, new URL(req.url).searchParams)).sort({ createdAt: -1 }).limit(5000).lean();
  const head = ["Reference", "Created", "Paid", "Status", "Type", "Customer", "Email", "Booking", "Amount", "Refunded", "Currency", "Stripe payment"];
  const body = rows.map((p) => [p.reference, p.createdAt.toISOString(), p.paidAt?.toISOString(), p.status, p.type, p.customerName, p.customerEmail, p.bookingReference, (p.amountCents / 100).toFixed(2), (p.refundedCents / 100).toFixed(2), p.currency, p.stripePaymentIntentId]);
  return new Response([head, ...body].map((r) => r.map(cell).join(",")).join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="payments.csv"', "Cache-Control": "no-store" },
  });
});
