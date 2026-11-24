import type { Metadata } from "next";
import { Legal } from "@/components/shared/legal";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/utils";
export const metadata: Metadata = { title: "Privacy Policy | E&J Remodeling", description: "How E&J Kitchen and Bathroom Remodeling, LLC collects and uses information submitted through this website.", alternates: { canonical: siteUrl() + "/privacy-policy" } };
export default async function Page() {
  const { settings: s } = await getSite();
  return <Legal title="Privacy Policy" sections={[
    ["Information we collect", "We collect the details you submit through our booking, contact, and review forms, such as your name, email address, phone number, property address, and project information. If we create a payment request for you, we also store its amount, reference, and status."],
    ["How we use it", "We use your information to respond to you, arrange consultations and estimates, plan requested work, process agreed payments, and publish reviews you have consented to share. Your email address is never published with a review."],
    ["Payments", "Online payments are handled by Stripe on its own secure page. We do not receive or store your card number."],
    ["Sharing", "We do not sell your information. It is shared only with service providers that host this website, store its data, deliver email, or process payments, and where the law requires it."],
    ["Cookies and security", "This website does not use advertising or tracking cookies. A sign-in cookie is used only for site administrators. To prevent abuse, we keep a short-lived, scrambled record of network addresses that submit forms."],
    ["Maps", "If a map is shown on our Contact page it is provided by Google, which may receive your network address when the map loads."],
    ["Your choices", `To ask for a copy of your information, correct it, or have it deleted, contact ${s.contactPerson} at ${s.email} or ${s.phone}.`],
  ]} />;
}
