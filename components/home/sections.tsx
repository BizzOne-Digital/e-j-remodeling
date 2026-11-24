import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, ClipboardList, FileSearch, HandHeart, Hammer, House, MessageCircle, MessagesSquare, PencilRuler, ScanSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/shared/sections";
import { ServiceIcon } from "@/components/shared/icons";
import { SmartImage } from "@/components/shared/smart-image";
import { ReviewCarousel } from "./review-carousel";
import type { HomeContent, ServiceItem } from "@/lib/defaults";
import type { PublicReview } from "@/lib/content";

export function ServicesOverview({ c, services }: { c: HomeContent["services"]; services: ServiceItem[] }) {
  return (
    <section className="marble pb-[clamp(4rem,8vw,7rem)] pt-6" aria-labelledby="services-h"><div className="wrap">
      <Heading id="services-h" title={<>{c.headingStart} <span className="text-royal">{c.headingHighlight}</span> {c.headingEnd}</>} text={c.description} />
      <ul className="reveal grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-6">
        {services.map((s) => (
          <li key={s.slug}><Link href={`/services#${s.slug}`} className="card group flex h-full min-h-32 flex-col items-center justify-center gap-3 p-4 font-semibold transition duration-300 hover:-translate-y-1 hover:border-primary sm:text-lg">
            <ServiceIcon name={s.icon} size={58} strokeWidth={1.150} className="text-royal transition group-hover:text-primary" />{s.title}
          </Link></li>
        ))}
      </ul>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <li key={s.slug} className="reveal card group overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-xl">
            <div className="relative aspect-[4/3] overflow-hidden bg-mist">
              <SmartImage src={s.image} alt={`${s.title} inspiration`} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="relative p-6 pt-9">
              <span className="grad absolute -top-7 left-6 grid size-14 place-items-center rounded-xl text-white shadow-lg"><ServiceIcon name={s.icon} size={28} /></span>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.shortDescription}</p>
              <Link href={`/services#${s.slug}`} className="mt-3 inline-flex min-h-11 items-center gap-2 font-btn font-bold text-royal hover:text-primary"><span>Learn More<span className="sr-only"> about {s.title}</span></span> <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden /></Link>
            </div>
          </li>
        ))}
      </ul>
    </div></section>
  );
}

export function About({ c }: { c: HomeContent["about"] }) {
  return (
    <section className="section overflow-hidden bg-mist" aria-labelledby="about-h"><div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="reveal relative">
        <div aria-hidden className="grad absolute -bottom-4 -left-4 h-2/5 w-2/5 rounded-2xl" />
        <div className="relative aspect-[7/6] overflow-hidden rounded-2xl shadow-xl"><SmartImage src={c.image} alt="Navy kitchen with a granite island, tile backsplash, and stainless steel appliances" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
      </div>
      <div className="reveal">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 id="about-h" className="h2 mt-3">{c.heading}</h2>
        {c.paragraphs.map((p) => <p key={p} className="mt-5 text-lg leading-relaxed text-[#475467]">{p}</p>)}
        <ul className="mt-7 grid gap-3.5 sm:grid-cols-2">{c.checklist.map((t) => <li key={t} className="flex items-start gap-3 font-medium"><CheckCircle2 size={22} className="mt-0.5 shrink-0 text-primary" aria-hidden />{t}</li>)}</ul>
        <Button asChild size="lg" className="mt-9"><Link href="/booking?type=estimate">{c.button}<ArrowRight size={19} aria-hidden /></Link></Button>
      </div>
    </div></section>
  );
}

export function Transformations({ c }: { c: HomeContent["transformations"] }) {
  return (
    <section className="section" aria-labelledby="tr-h"><div className="wrap">
      <Heading id="tr-h" title={c.heading} />
      <div className="grid gap-6 lg:grid-cols-2">
        {([[c.kitchen, "cabinets"], [c.bathroom, "showers"]] as const).map(([f, slug]) => (
          <Link key={slug} href={`/services#${slug}`} className="reveal group relative isolate flex min-h-[440px] flex-col justify-end overflow-hidden rounded-2xl bg-navy p-7 text-white sm:p-10 lg:min-h-[520px]">
            <SmartImage src={f.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="-z-20 object-cover transition duration-700 group-hover:scale-105" />
            <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,13,24,.1)_20%,rgba(4,13,24,.9)_72%)]" />
            <h3 className="font-serif text-[clamp(1.500rem,2.600vw,2.100rem)] font-bold">{f.title}</h3>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-[#e4ebf2]">{f.text}</p>
            <span className="mt-5 inline-flex items-center gap-2.5 font-btn font-bold text-[#7cc8ff]">{f.button}<ArrowRight size={19} className="transition-transform group-hover:translate-x-1.5" aria-hidden /></span>
          </Link>
        ))}
      </div>
    </div></section>
  );
}

const WHY = [ShieldCheck, MessageCircle, BadgeCheck, ScanSearch, HandHeart, ClipboardList];
export function WhyChooseUs({ c }: { c: HomeContent["whyChooseUs"] }) {
  return (
    <section className="section relative isolate overflow-hidden bg-night text-white" aria-labelledby="why-h">
      <svg aria-hidden className="absolute -right-40 -top-20 -z-10 w-[780px] opacity-25" viewBox="0 0 780 600" fill="none" stroke="#0078D4"><path d="M0 420C160 120 420 180 520 300S720 420 780 120M0 460C160 160 420 220 520 340S720 460 780 160M0 500C160 200 420 260 520 380S720 500 780 200" /></svg>
      <div className="wrap">
        <Heading id="why-h" title={c.heading} text={c.description} dark />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((it, i) => {
            const I = WHY[i % WHY.length];
            return (
              <li key={it.title} className="reveal group rounded-2xl border border-bright/25 bg-white/[.05] p-7 transition duration-300 hover:border-bright/80 hover:bg-white/[.08]">
                <I size={38} strokeWidth={1.400} className="text-bright transition-transform duration-300 group-hover:-translate-y-1" aria-hidden />
                <h3 className="mt-5 text-xl font-bold">{it.title}</h3>
                <p className="mt-2.5 leading-relaxed text-silver">{it.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [MessagesSquare, FileSearch, PencilRuler, House];
export function Process({ c }: { c: HomeContent["process"] }) {
  return (
    <section className="section bg-mist" aria-labelledby="process-h"><div className="wrap">
      <Heading id="process-h" title={c.heading} text={c.description} />
      <ol className="grid gap-0 lg:grid-cols-4 lg:gap-8">
        {c.steps.map((s, i) => {
          const I = STEPS[i] ?? Hammer;
          const last = i === c.steps.length - 1;
          return (
            <li key={s.title} className="relative flex gap-6 pb-10 last:pb-0 lg:block lg:pb-0">
              {last ? null : <><span aria-hidden className="absolute bottom-0 left-8 top-16 w-0.5 bg-silver lg:hidden" /><span aria-hidden className="reveal-line absolute left-20 right-[-2rem] top-8 hidden h-0.5 bg-gradient-to-r from-primary to-silver lg:block" /></>}
              <span className="grad relative z-10 grid size-16 shrink-0 place-items-center rounded-full text-white shadow-lg ring-8 ring-mist"><I size={28} strokeWidth={1.600} aria-hidden /></span>
              <div className="reveal lg:mt-6">
                <p className="font-serif text-4xl font-bold text-primary"><span className="sr-only">Step </span>{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-[#526070]">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div></section>
  );
}

export function Testimonials({ c, reviews }: { c: HomeContent["testimonials"]; reviews: PublicReview[] }) {
  return (
    <section className="section marble" aria-labelledby="rev-h"><div className="wrap">
      <Heading id="rev-h" title={c.heading} />
      {reviews.length ? (
        <><ReviewCarousel reviews={reviews} /><div className="mt-10 text-center"><Button asChild variant="light" size="lg"><Link href="/testimonials">View All Testimonials</Link></Button></div></>
      ) : (
        <div className="reveal card mx-auto max-w-2xl p-8 text-center sm:p-12">
          <MessagesSquare size={44} strokeWidth={1.300} className="mx-auto text-primary" aria-hidden />
          <h3 className="mt-4 text-2xl font-bold">{c.emptyTitle}</h3>
          <p className="mx-auto mt-3 max-w-lg text-lg leading-relaxed text-muted">{c.emptyText}</p>
          <Button asChild className="mt-6"><Link href="/testimonials#leave-review">Share Your Experience</Link></Button>
        </div>
      )}
    </div></section>
  );
}
