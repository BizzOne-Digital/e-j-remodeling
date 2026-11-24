import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { About, Process, ServicesOverview, Testimonials, Transformations, WhyChooseUs } from "@/components/home/sections";
import { Gallery } from "@/components/home/gallery";
import { FaqList } from "@/components/home/faq-list";
import { FinalCta, Heading } from "@/components/shared/sections";
import { JsonLd } from "@/components/shared/json-ld";
import { getReviews, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMeta("home", "/");

export default async function HomePage() {
  const [{ settings, home, services, faqs, gallery }, reviews] = await Promise.all([getSite(), getReviews()]);
  const show = home.sections;
  return (
    <>
      <Hero hero={home.hero} settings={settings} />
      {show.services && services.length ? <ServicesOverview c={home.services} services={services} /> : null}
      {show.about ? <About c={home.about} /> : null}
      {show.transformations ? <Transformations c={home.transformations} /> : null}
      {show.whyChooseUs ? <WhyChooseUs c={home.whyChooseUs} /> : null}
      {show.gallery && gallery.length ? (
        <section className="section marble" aria-labelledby="gallery-h"><div className="wrap">
          <Heading id="gallery-h" title={home.gallery.heading} text={home.gallery.description} lines={false} />
          <Gallery items={gallery} />
        </div></section>
      ) : null}
      {show.process ? <Process c={home.process} /> : null}
      {show.testimonials ? <Testimonials c={home.testimonials} reviews={reviews.items} /> : null}
      {show.faq && faqs.length ? (
        <section className="section" aria-labelledby="faq-h"><div className="wrap grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div className="reveal lg:sticky lg:top-32 lg:self-start"><h2 id="faq-h" className="h2">{home.faq.heading}</h2><p className="mt-4 text-lg text-muted">{home.faq.description}</p></div>
          <FaqList items={faqs} />
          <JsonLd data={{ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }} />
        </div></section>
      ) : null}
      {show.cta ? <FinalCta cta={home.cta} settings={settings} /> : null}
    </>
  );
}
