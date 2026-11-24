import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./smart-image";
import { JsonLd } from "./json-ld";
import { cn, siteUrl, telHref } from "@/lib/utils";
import type { HomeContent, Settings } from "@/lib/defaults";

export function Heading({ title, text, dark, lines = true, id }: { title: React.ReactNode; text?: string; dark?: boolean; lines?: boolean; id?: string }) {
  return (
    <div className="reveal mx-auto mb-12 max-w-5xl text-center">
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {lines ? <span aria-hidden className="line-l reveal-line hidden shrink sm:block" /> : null}
        <h2 id={id} className={cn("h2", dark && "text-white")}>{title}</h2>
        {lines ? <span aria-hidden className="line-r reveal-line hidden shrink sm:block" /> : null}
      </div>
      {text ? <p className={cn("mx-auto mt-4 max-w-2xl text-lg leading-relaxed", dark ? "text-silver" : "text-muted")}>{text}</p> : null}
    </div>
  );
}

/** Blue and silver curved divider that closes dark photographic sections. */
export function Wave({ fill = "#fff" }: { fill?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1536 120" preserveAspectRatio="none" className="wave pointer-events-none absolute inset-x-0 -bottom-px z-10 h-[clamp(46px,7.6vw,118px)] w-full">
      <defs><linearGradient id="wv" x1="0" x2="1"><stop offset="0" stopColor="#0078D4" /><stop offset=".3" stopColor="#0754B8" /><stop offset=".55" stopColor="#0B2239" stopOpacity=".4" /><stop offset="1" stopColor="#C5CFDA" stopOpacity=".75" /></linearGradient></defs>
      <path fill="url(#wv)" d="M0 24 C220 -14 440 14 640 38 C980 92 1260 92 1536 22 V120 H0Z" />
      <path fill={fill} d="M0 62 C200 14 420 24 640 50 C980 96 1270 100 1536 44 V120 H0Z" />
    </svg>
  );
}

export function PageHero({ heading, description, image, crumb, path }: { heading: string; description: string; image: string; crumb: string; path: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <SmartImage src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-right" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,13,24,.9)_10%,rgba(4,13,24,.62)_48%,rgba(4,13,24,.12)_80%)]" />
      <div className="wrap pb-[clamp(6rem,12vw,10rem)] pt-[clamp(3.5rem,7vw,6rem)]">
        <nav aria-label="Breadcrumb" className="rise mb-5">
          <ol className="flex items-center gap-1.5 text-sm text-silver">
            <li><Link href="/" className="inline-block py-1 hover:text-white hover:underline">Home</Link></li>
            <li aria-hidden><ChevronRight size={15} /></li>
            <li aria-current="page" className="text-white">{crumb}</li>
          </ol>
        </nav>
        <h1 className="rise max-w-3xl text-[clamp(2rem,4.8vw,3.5rem)] leading-[1.14]" style={{ "--i": 1 } as React.CSSProperties}>{heading}</h1>
        <span aria-hidden className="draw mt-6 block h-[3px] w-24 rounded bg-bright" />
        <p className="rise mt-6 max-w-2xl text-lg leading-relaxed text-[#dbe4ee]" style={{ "--i": 2 } as React.CSSProperties}>{description}</p>
      </div>
      <Wave />
      <JsonLd data={{ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl() }, { "@type": "ListItem", position: 2, name: crumb, item: siteUrl() + path }] }} />
    </section>
  );
}

export function FinalCta({ cta, settings }: { cta: HomeContent["cta"]; settings: Settings }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-center text-white">
      <SmartImage src={cta.image} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(4,13,24,.8),rgba(4,13,24,.6))]" />
      <div className="wrap reveal py-[clamp(4.5rem,10vw,8.5rem)]">
        <h2 className="h2 mx-auto max-w-3xl">{cta.heading}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#dbe4ee]">{cta.description}</p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg"><Link href="/booking?type=estimate">{cta.button}</Link></Button>
          <Button asChild size="lg" variant="outline"><a href={telHref(settings.phone)}><Phone size={19} aria-hidden />Call {settings.phone}</a></Button>
        </div>
      </div>
    </section>
  );
}
