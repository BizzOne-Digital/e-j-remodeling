import { requireAdmin } from "@/lib/auth";
import { ensureSeeded } from "@/lib/content";
import { handler, ok } from "@/lib/http";
import { isMailConfigured } from "@/lib/mail";
import { isStripeConfigured } from "@/lib/payments";
import { Booking, ContactInquiry, Payment, Testimonial } from "@/models";

export const GET = handler(async () => {
  await requireAdmin();
  await ensureSeeded();
  const recent = { createdAt: -1 } as const;
  const [bookings, pendingBookings, confirmedBookings, inquiries, unread, approved, pendingReviews, paid, b, i, t, p] = await Promise.all([
    Booking.countDocuments(), Booking.countDocuments({ status: "Pending" }), Booking.countDocuments({ status: "Confirmed" }),
    ContactInquiry.countDocuments(), ContactInquiry.countDocuments({ read: false }),
    Testimonial.countDocuments({ status: "Approved" }), Testimonial.countDocuments({ status: "Pending" }),
    Payment.aggregate<{ total: number; count: number }>([{ $match: { status: "Paid" } }, { $group: { _id: null, total: { $sum: { $subtract: ["$amountCents", "$refundedCents"] } }, count: { $sum: 1 } } }]),
    Booking.find().select("reference fullName status createdAt").sort(recent).limit(6).lean(), ContactInquiry.find().select("fullName subject status createdAt").sort(recent).limit(6).lean(),
    Testimonial.find().select("fullName rating status createdAt").sort(recent).limit(6).lean(), Payment.find().select("reference customerName status createdAt").sort(recent).limit(6).lean(),
  ]);
  const activity = [
    ...b.map((x) => ({ kind: "Booking", href: "/admin/bookings", text: `${x.fullName} (${x.reference})`, status: x.status, at: x.createdAt })),
    ...i.map((x) => ({ kind: "Inquiry", href: "/admin/inquiries", text: `${x.fullName}: ${x.subject}`, status: x.status, at: x.createdAt })),
    ...t.map((x) => ({ kind: "Review", href: "/admin/testimonials", text: `${x.fullName}, ${x.rating} of 5 stars`, status: x.status, at: x.createdAt })),
    ...p.map((x) => ({ kind: "Payment", href: "/admin/payments", text: `${x.customerName} (${x.reference})`, status: x.status, at: x.createdAt })),
  ].sort((x, y) => +y.at - +x.at).slice(0, 10);
  return ok({
    stats: { bookings, pendingBookings, confirmedBookings, inquiries, unread, approved, pendingReviews, paidCents: paid[0]?.total ?? 0, paidCount: paid[0]?.count ?? 0 },
    activity, config: { stripe: isStripeConfigured(), stripeLive: Boolean(process.env.STRIPE_SECRET_KEY?.includes("_live_")), mail: isMailConfigured() },
  });
});
