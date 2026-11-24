import "server-only";
import Stripe from "stripe";
import type mongoose from "mongoose";
import { Payment, type IPayment } from "@/models";
import { HttpError } from "./http";
import { siteUrl } from "./utils";

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new HttpError(503, "Online payments are not enabled yet. Please call us to arrange payment.");
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}
type Doc = IPayment & { _id: mongoose.Types.ObjectId };

export async function startCheckout(token: string) {
  if (!isStripeConfigured()) throw new HttpError(503, "Online payments are not enabled yet. Please call us to arrange payment.");
  const p = await Payment.findOne({ token }).lean<Doc>();
  if (!p) throw new HttpError(404, "Payment request not found.");
  if (!["Unpaid", "Pending", "Failed"].includes(p.status)) throw new HttpError(409, `This payment request is ${p.status.toLowerCase()}.`);
  if (p.stripeSessionId) {
    const s = await stripe().checkout.sessions.retrieve(p.stripeSessionId);
    if (s.status === "open" && s.url) return s.url;
    // Completed but not settled (e.g. bank debit): never allow a second charge while the first is in flight.
    if (s.status === "complete" && p.status !== "Failed") throw new HttpError(409, "This payment has been submitted and is being processed.");
  }
  // The amount comes only from our database; the idempotency key makes double clicks share one session.
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: p.customerEmail,
    client_reference_id: p.reference,
    line_items: [{ quantity: 1, price_data: { currency: p.currency, unit_amount: p.amountCents, product_data: { name: `${p.type} (${p.reference})`, ...(p.description ? { description: p.description.slice(0, 400) } : {}) } } }],
    metadata: { paymentId: String(p._id) },
    payment_intent_data: { metadata: { paymentId: String(p._id) }, receipt_email: p.customerEmail },
    success_url: `${siteUrl()}/payment/success?token=${p.token}`,
    cancel_url: `${siteUrl()}/payment/cancel?token=${p.token}`,
  }, { idempotencyKey: `checkout-${p._id}-${p.checkoutAttempt}` });
  const updated = await Payment.updateOne(
    { _id: p._id, status: { $in: ["Unpaid", "Pending", "Failed"] }, checkoutAttempt: p.checkoutAttempt },
    { $set: { stripeSessionId: session.id, status: "Pending" }, $inc: { checkoutAttempt: 1 } });
  if (!updated.matchedCount) {
    // Lost a race: fine if the winner stored this same session, otherwise the request changed under us.
    const now = await Payment.findById(p._id).select("stripeSessionId status").lean<Doc>();
    if (now?.stripeSessionId !== session.id || now.status !== "Pending") {
      await stripe().checkout.sessions.expire(session.id).catch(() => undefined);
      throw new HttpError(409, "This payment request has changed. Refresh the page and try again.");
    }
  }
  if (!session.url) throw new HttpError(502, "Could not start checkout. Please try again.");
  return session.url;
}

/** Applies a verified Stripe event. Every update is conditional, so replays and reordering are harmless. Returns the payment when newly paid. */
export async function applyStripeEvent(event: Stripe.Event): Promise<IPayment | null> {
  if (event.type.startsWith("checkout.session.")) {
    const s = event.data.object as Stripe.Checkout.Session;
    const id = s.metadata?.paymentId;
    if (!id || !/^[a-f0-9]{24}$/.test(id)) return null;
    const intent = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? "";
    const isPaid = (event.type === "checkout.session.completed" && s.payment_status === "paid") || event.type === "checkout.session.async_payment_succeeded";
    if (isPaid) {
      return Payment.findOneAndUpdate(
        { _id: id, amountCents: s.amount_total ?? -1, currency: s.currency ?? "", status: { $nin: ["Paid", "Refunded"] } },
        { $set: { status: "Paid", paidAt: new Date(event.created * 1000), stripeSessionId: s.id, stripePaymentIntentId: intent } }, { returnDocument: "after" }).lean<IPayment>();
    }
    const open = { _id: id, stripeSessionId: s.id, status: { $in: ["Unpaid", "Pending"] } };
    if (event.type === "checkout.session.completed") await Payment.updateOne(open, { $set: { status: "Pending", stripePaymentIntentId: intent } });
    if (event.type === "checkout.session.async_payment_failed") await Payment.updateOne(open, { $set: { status: "Failed" } });
    if (event.type === "checkout.session.expired") await Payment.updateOne(open, { $set: { status: "Unpaid", stripeSessionId: "" } });
  } else if (event.type === "charge.refunded") {
    const c = event.data.object as Stripe.Charge;
    const intent = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
    if (intent) {
      const r = await Payment.updateOne({ stripePaymentIntentId: intent }, { $max: { refundedCents: c.amount_refunded }, ...(c.refunded ? { $set: { status: "Refunded" } } : {}) });
      // Refund arrived before the completion event: fail so Stripe retries rather than losing it.
      if (!r.matchedCount && c.metadata?.paymentId) throw new Error("Payment not settled yet");
    }
  }
  return null;
}
