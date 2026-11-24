import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactCards } from "@/components/shared/contact-cards";
import { PageHero } from "@/components/shared/sections";
import { getSite } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMeta("contact", "/contact");
export default async function ContactPage() {
  const { settings: s, home } = await getSite();
  return (
    <>
      <PageHero {...home.pages.contact} crumb="Contact" path="/contact" />
      <section className="section marble" aria-labelledby="c-h"><div className="wrap grid gap-10 lg:grid-cols-[1fr_1.500fr]">
        <div><h2 id="c-h" className="h2 mb-4">Get in touch</h2><p className="mb-7 text-lg leading-relaxed text-muted">Call, email, or send a message. We are happy to talk through your ideas and arrange a free estimate.</p><ContactCards s={s} /></div>
        <ContactForm />
      </div>
        {s.showMap && s.businessAddress ? <div className="wrap mt-12"><iframe title={`Map showing ${s.businessAddress}`} loading="lazy" referrerPolicy="no-referrer" src={`https://www.google.com/maps?q=${encodeURIComponent(s.businessAddress)}&output=embed`} className="h-96 w-full rounded-2xl border" /></div> : null}
      </section>
    </>
  );
}
