import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Check, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinalCta, PageHero } from "@/components/shared/sections";
import { ServiceIcon } from "@/components/shared/icons";
import { SmartImage } from "@/components/shared/smart-image";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { getSite } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const generateMetadata = (): Promise<Metadata> => pageMeta("services", "/services");
export default async function ServicesPage() {
  const { settings, home, services } = await getSite();
  return (
    <>
      <PageHero {...home.pages.services} crumb="Services" path="/services" />
      <nav aria-label="Jump to a service" className="wrap pt-8"><ul className="flex flex-wrap justify-center gap-3">
        {services.map((s) => <li key={s.slug}><a href={`#${s.slug}`} className="card flex min-h-12 items-center gap-2.5 px-5 font-semibold hover:border-primary hover:text-royal"><ServiceIcon name={s.icon} size={21} className="text-primary" />{s.title}</a></li>)}
      </ul></nav>
      {services.map((s, i) => {
        const opt = (SERVICE_OPTIONS as readonly string[]).includes(s.title) ? `service=${s.title}` : "";
        return (
          <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-h`} className={cn("section", i % 2 === 1 && "bg-mist")}><div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className={cn("reveal relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl", i % 2 === 1 && "lg:order-2")}><SmartImage src={s.image} alt={`${s.title} inspiration`} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
            <div className="reveal">
              <span className="grad grid size-14 place-items-center rounded-xl text-white"><ServiceIcon name={s.icon} size={30} /></span>
              <h2 id={`${s.slug}-h`} className="h2 mt-5">{s.title}</h2>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-[#475467]">{s.description || s.shortDescription}</p>
              <div className="mt-7 grid gap-7 sm:grid-cols-2">
                {s.benefits.length ? <div><h3 className="mb-3 font-bold">Key benefits</h3><ul className="grid gap-2.5">{s.benefits.map((b) => <li key={b} className="flex gap-2.5"><Check size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden />{b}</li>)}</ul></div> : null}
                {s.options.length ? <div><h3 className="mb-3 font-bold">Related improvements</h3><ul className="flex flex-wrap gap-2">{s.options.map((o) => <li key={o} className="rounded-full border border-silver bg-white px-3.5 py-1.5 text-sm font-medium">{o}</li>)}</ul></div> : null}
              </div>
              <p className="mt-6 font-semibold text-royal">Contact for pricing. Estimates are free.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild><Link href={`/booking?type=estimate&${opt}`}><ClipboardCheck size={19} aria-hidden />Request an Estimate</Link></Button>
                <Button asChild variant="light"><Link href={`/booking?${opt}`}><CalendarDays size={19} aria-hidden />Book Consultation</Link></Button>
              </div>
            </div>
          </div></section>
        );
      })}
      <FinalCta cta={home.cta} settings={settings} />
    </>
  );
}
