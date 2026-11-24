"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleAlert, Clock, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api } from "@/lib/api";
import { paymentLookupSchema } from "@/validators/forms";

export function PaymentLookup() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(paymentLookupSchema), defaultValues: { reference: "", email: "" } });
  const go = handleSubmit(async (d) => {
    try { const r = await api<{ token: string }>("/api/payments/lookup", { body: d }); router.push(`/payment?token=${r.token}`); }
    catch (e) { toast.error((e as Error).message); }
  });
  return (
    <form noValidate onSubmit={go} className="grid gap-5">
      <Field label="Payment Reference" error={errors.reference?.message}><Input placeholder="PAY-XXXXXXXX" autoComplete="off" className="uppercase" {...register("reference")} /></Field>
      <Field label="Email Address" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
      <Button size="lg" disabled={isSubmitting}>{isSubmitting ? "Checking..." : "Find My Payment"}</Button>
    </form>
  );
}

export function PayButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  async function pay() {
    setBusy(true);
    try { const r = await api<{ url: string }>("/api/payments/checkout", { body: { token } }); window.location.assign(r.url); }
    catch (e) { toast.error((e as Error).message); setBusy(false); }
  }
  return <Button size="lg" className="w-full" disabled={busy} onClick={pay}>{busy ? <><LoaderCircle size={20} className="animate-spin" aria-hidden />Opening secure checkout...</> : "Continue to Secure Checkout"}</Button>;
}

/** Shows only what the server has verified through Stripe's webhook. */
export function PaymentStatus({ token }: { token: string }) {
  const [status, setStatus] = useState(token ? "loading" : "unknown");
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (!token || tries > 20) return;
    let live = true;
    const t = setTimeout(async () => {
      const s = await api<{ status: string }>(`/api/payments/status?token=${token}`).then((r) => r.status, (e) => (e.status === 404 ? "unknown" : "retry"));
      if (!live) return;
      if (s !== "retry") setStatus(s);
      if (["Pending", "Unpaid", "retry"].includes(s)) setTries((n) => n + 1);
    }, tries ? 3000 : 0);
    return () => { live = false; clearTimeout(t); };
  }, [token, tries]);
  const view = status === "Paid" ? [CheckCircle2, "Payment confirmed", "Thank you. Your payment has been verified, and a receipt is sent to your email by Stripe."]
    : status === "loading" ? [LoaderCircle, "Checking your payment", "One moment while we check with our payment provider."]
    : ["Pending", "Unpaid"].includes(status) ? [Clock, "Payment processing", "We are waiting for confirmation from our payment provider. This page updates automatically, and it is safe to leave."]
    : status === "Failed" ? [CircleAlert, "Payment failed", "The payment could not be completed. Please try again or contact us."]
    : status === "Refunded" ? [CircleAlert, "Payment refunded", "This payment has been refunded."]
    : status === "Cancelled" ? [CircleAlert, "Request cancelled", "This payment request has been cancelled. Please contact us with any questions."]
    : [CircleAlert, "Payment not found", "We could not find that payment. Please use the link from your payment request."];
  const [I, title, text] = view as [typeof Clock, string, string];
  return (
    <div role="status" className="text-center">
      <I size={56} strokeWidth={1.400} className={`mx-auto text-primary ${status === "loading" ? "animate-spin" : ""}`} aria-hidden />
      <h2 className="mt-4 text-2xl">{title}</h2><p className="mt-3 leading-relaxed text-muted">{text}</p>
      {status === "Failed" ? <Button asChild className="mt-6"><Link href={`/payment?token=${token}`}>Try Again</Link></Button> : <Button asChild variant="light" className="mt-6"><Link href="/">Back to Home</Link></Button>}
    </div>
  );
}
