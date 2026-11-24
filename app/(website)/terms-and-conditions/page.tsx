import type { Metadata } from "next";
import { Legal } from "@/components/shared/legal";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/utils";
export const metadata: Metadata = { title: "Terms and Conditions | E&J Remodeling", description: "Terms for using the E&J Kitchen and Bathroom Remodeling, LLC website, booking requests, estimates, and online payments.", alternates: { canonical: siteUrl() + "/terms-and-conditions" } };
export default async function Page() {
  const { settings: s } = await getSite();
  return <Legal title="Terms and Conditions" sections={[
    ["Using this website", `This website is provided by ${s.businessName} for information and to let homeowners request our services. Please provide accurate information and do not misuse the site.`],
    ["Booking requests", "Submitting a booking form is a request, not a confirmed appointment. An appointment is confirmed only when we contact you to accept it."],
    ["Estimates and pricing", "Costs and timelines depend on the confirmed project scope, materials, and site conditions. Nothing on this website is a fixed price or a completion guarantee. The terms of any work are set out in the agreement made for that project."],
    ["Online payments", "Payment requests are created for amounts agreed with you. Please check the details before paying. Questions about a payment or refund should be raised with us directly."],
    ["Images", "Photographs marked as design inspiration illustrate ideas and do not show work completed by us."],
    ["Reviews", "Reviews must reflect a genuine experience. We check reviews before publishing and may decline content that is unlawful, abusive, or unrelated to our services."],
    ["Contact", `Questions about these terms can be sent to ${s.email} or raised by calling ${s.phone}.`],
  ]} />;
}
