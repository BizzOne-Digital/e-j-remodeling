import { getImageProps } from "next/image";
import Link from "next/link";
import { CalendarDays, ClipboardCheck, Handshake, Phone, ShieldCheck, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wave } from "@/components/shared/sections";
import { telHref } from "@/lib/utils";
import type { HomeContent, Settings } from "@/lib/defaults";

const ICONS = [ShieldCheck, Handshake, ThumbsUp];
const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** Art-directed background: portrait crop on phones, right-weighted landscape on larger screens. */
function HeroPicture({ desktop, mobile }: { desktop: string; mobile: string }) {
  const common = { alt: "", quality: 75, priority: true, sizes: "100vw" };
  const big = getImageProps({ ...common, src: desktop || "/images/hero-kitchen.webp", width: 2400, height: 1400, sizes: "100vw" }).props;
  const small = getImageProps({ ...common, src: mobile || "/images/hero-mobile.webp", width: 1080, height: 1600 }).props;
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={big.srcSet} sizes={big.sizes} />
      <img {...small} alt="" fetchPriority="high" className="drift absolute inset-0 size-full object-cover object-bottom md:object-right" />
    </picture>
  );
}

export function Hero({ hero: h, settings: s }: { hero: HomeContent["hero"]; settings: Settings }) {
  // Matches the brand lockup: the line breaks after "and".
  const cut = h.heading.indexOf(" and ");
  const first = cut < 0 ? h.heading : h.heading.slice(0, cut + 4), rest = cut < 0 ? "" : h.heading.slice(cut + 5);
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-y-0 right-0 -z-20 w-full overflow-hidden"><HeroPicture desktop={h.desktopImage} mobile={h.mobileImage} /></div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,13,24,.45),rgba(4,13,24,.72)_45%,rgba(4,13,24,.55))] lg:bg-[linear-gradient(90deg,rgba(4,13,24,.94)_12%,rgba(4,13,24,.72)_34%,rgba(4,13,24,.2)_58%,transparent_72%)]" />
      <div className="wrap flex min-h-[620px] flex-col justify-center pb-[clamp(7rem,11vw,9.500rem)] pt-14 lg:min-h-[690px] lg:pt-16">
        <p className="rise mb-5 flex items-center gap-6 font-btn text-[clamp(.7rem,1.200vw,1.050rem)] font-bold tracking-[.18em]" style={d(0)}>
          <span className="whitespace-pre-wrap">{h.eyebrow}</span><span aria-hidden className="draw hidden h-[3px] w-24 rounded bg-primary sm:block" />
        </p>
        <h1 className="rise max-w-[880px] [text-wrap:wrap] text-[clamp(1.9rem,3.5vw,3.35rem)] leading-[1.2] [text-shadow:0_2px_14px_rgba(4,13,24,.7)]" style={d(1)}>
          <span className="mr-[.12em] inline-block bg-[linear-gradient(135deg,#4db5ff,#0a7be0)] bg-clip-text pb-[.16em] -mb-[.16em] text-[1.16em] leading-none text-transparent [text-shadow:none]">{h.highlight}</span>{" "}{first}{rest ? <> <span className="md:block">{rest}</span></> : null}
        </h1>
        <p className="rise mt-5 max-w-[640px] text-[clamp(1.060rem,1.700vw,1.500rem)] leading-[1.42] text-[#eef3f8]" style={d(2)}>{h.description}</p>
        <ul className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-0" style={d(3)}>
          {h.trustIndicators.slice(0, 3).map((t, i) => {
            const I = ICONS[i];
            return <li key={t} className="flex items-center gap-3 text-base font-semibold sm:border-l sm:border-primary sm:px-8 sm:text-lg sm:first:border-0 sm:first:pl-1"><I size={42} strokeWidth={1.300} className="size-8 sm:size-[42px]" aria-hidden />{t}</li>;
          })}
        </ul>
        <div className="rise mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={d(4)}>
          <Button asChild size="lg"><Link href="/booking?type=estimate"><ClipboardCheck size={22} aria-hidden />{h.primaryButton}</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/booking"><CalendarDays size={22} aria-hidden />{h.secondaryButton}</Link></Button>
          <a href={telHref(s.phone)} className="inline-flex min-h-12 items-center justify-center gap-2.5 font-btn text-lg font-bold hover:text-bright sm:px-3"><Phone size={21} className="fill-current" aria-hidden />{s.phone}</a>
        </div>
      </div>
      <Wave />
    </section>
  );
}
