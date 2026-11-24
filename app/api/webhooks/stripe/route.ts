import { after } from "next/server";
import type Stripe from "stripe";
import { connectDB, isDbConfigured } from "@/lib/db";
import { notifyAdmin, sendMail } from "@/lib/mail";
import { applyStripeEvent, isStripeConfigured, stripe } from "@/lib/payments";
import { money } from "@/lib/utils";
import { WebhookEvent } from "@/models";

export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!isStripeConfigured() || !isDbConfigured()) return new Response("Not configured", { status: 503 });
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), req.headers.get("stripe-signature") ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch { return new Response("Invalid signature", { status: 400 }); }
  try {
    await connectDB();
    if (await WebhookEvent.exists({ eventId: event.id })) return Response.json({ received: true, duplicate: true });
    const paid = await applyStripeEvent(event);
    // Recorded only after success, so a failed attempt is retried by Stripe.
    await WebhookEvent.create({ eventId: event.id, type: event.type }).catch((e) => { if (e?.code !== 11000) throw e; });
    if (paid) after(async () => {
      const amount = money(paid.amountCents, paid.currency);
      await sendMail(paid.customerEmail, `Payment received (${paid.reference})`, `Hello ${paid.customerName},\n\nWe received your payment of ${amount} for ${paid.type} (${paid.reference}).\n\nThank you,\nE&J Kitchen and Bathroom Remodeling, LLC`);
      await notifyAdmin(`Payment received ${paid.reference}`, { Reference: paid.reference, Customer: paid.customerName, Amount: amount, Type: paid.type });
    });
    return Response.json({ received: true });
  } catch (e) {
    console.error("[stripe webhook]", event.type, (e as Error).name);
    return new Response("Processing failed", { status: 500 });
  }
}
