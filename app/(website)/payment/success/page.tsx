import type { Metadata } from "next";
import { PaymentShell } from "@/components/shared/payment-shell";
import { PaymentStatus } from "@/components/forms/payment-forms";
export const metadata: Metadata = { title: "Payment Status | E&J Remodeling", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <PaymentShell title="Payment Status"><PaymentStatus token={typeof token === "string" && /^[a-f0-9]{48}$/.test(token) ? token : ""} /></PaymentShell>;
}
