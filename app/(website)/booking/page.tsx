import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/booking-form";
import { ContactCards } from "@/components/shared/contact-cards";
import { PageHero } from "@/components/shared/sections";
import { getSite } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMeta("booking", "/booking");
const NEXT = ["We receive your request and give you a reference number.", "We review your project and contact you by your preferred method.", "Together we confirm a time. Your requested slot is held only once confirmed.", "We discuss your vision and your free estimate. No upfront payment is needed to book."];
export default async function BookingPage() {
  const { settings, home } = await getSite();
  return (
    <>
      <PageHero {...home.pages.booking} crumb="Booking" path="/booking" />
      <section className="section marble" aria-label="Booking request"><div className="wrap grid gap-10 lg:grid-cols-[1.600fr_1fr]">
        <div id="form"><BookingForm /></div>
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="mb-6 rounded-2xl bg-night p-7 text-white">
            <h2 className="text-2xl">What happens next</h2>
            <ol className="mt-5 grid gap-5">{NEXT.map((t, i) => <li key={t} className="flex gap-4 leading-relaxed text-[#dbe4ee]"><span className="grad grid size-9 shrink-0 place-items-center rounded-full font-bold text-white">{i + 1}</span>{t}</li>)}</ol>
          </div>
          <ContactCards s={settings} />
        </aside>
      </div></section>
    </>
  );
}
