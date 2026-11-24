import type { Metadata } from "next";
import Link from "next/link";
import { PaymentShell } from "@/components/shared/payment-shell";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = { title: "Payment Not Completed | E&J Remodeling", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && /^[a-f0-9]{48}$/.test(token);
  return (
    <PaymentShell title="Payment Not Completed">
      <p className="text-lg leading-relaxed text-[#475467]">You left checkout before paying, so no payment was taken. You can return whenever you are ready.</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button asChild><Link href={valid ? `/payment?token=${token}` : "/payment"}>Return to Payment</Link></Button><Button asChild variant="light"><Link href="/contact">Contact Us</Link></Button></div>
    </PaymentShell>
  );
}
