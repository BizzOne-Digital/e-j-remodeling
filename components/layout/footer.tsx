import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackToTop } from "./back-to-top";
import { telHref } from "@/lib/utils";
import type { Settings } from "@/lib/defaults";

const SOCIAL: Record<string, [string, string]> = {
  facebookUrl: ["Facebook", "M14 8h3V4h-3c-2.800 0-5 2.200-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z"],
  instagramUrl: ["Instagram", "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.500a4.500 4.500 0 1 1 0 9 4.500 4.500 0 0 1 0-9zm0 2a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5zM17.300 5.700a1.100 1.100 0 1 1 0 2.200 1.100 1.100 0 0 1 0-2.200z"],
  googleUrl: ["Google", "M12 10.500h9.500c.1.600.2 1.200.2 2 0 5.500-3.700 9.500-9.700 9.500a10 10 0 1 1 6.700-17.400l-2.800 2.700A6 6 0 1 0 12 18c3.300 0 5.300-1.900 5.700-4.200H12z"],
  houzzUrl: ["Houzz", "M4 2h4v6l12 3.500V22h-7v-6h-3v6H4z"],
  linkedinUrl: ["LinkedIn", "M3 9h4v12H3zM5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm5 6h4v1.700c.6-1 1.900-2 3.700-2 3.300 0 4.300 2 4.300 5.300v7h-4v-6.300c0-1.600-.3-2.900-2-2.900s-2 1.400-2 2.900V21h-4z"],
};
const h = "mb-4 font-sans text-base font-bold text-white";
const a = "inline-flex min-h-9 items-center transition hover:text-bright";

export function Footer({ settings: s, services }: { settings: Settings; services: { title: string; slug: string }[] }) {
  const social = Object.entries(s.social).filter(([k, v]) => v && SOCIAL[k]);
  return (
    <footer className="bg-ink pb-24 text-silver lg:pb-0">
      <div aria-hidden className="h-[3px] bg-[linear-gradient(90deg,#0754B8,#159DFF_40%,#C5CFDA)]" />
      <div className="wrap grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_.8fr_.8fr_1.2fr]">
        <div>
          <Image src={s.logoImage || "/images/logo.png"} alt={s.businessName} width={1200} height={400} sizes="300px" className="-ml-1 -mt-5 h-auto w-[280px]" />
          <p className="max-w-sm leading-relaxed">{s.footerText}</p>
          <p className="mt-4 font-semibold text-white">{s.tagline}</p>
          {social.length ? (
            <ul className="mt-5 flex gap-3">
              {social.map(([k, url]) => (
                <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL[k][0]} className="grid size-11 place-items-center rounded-lg border border-white/20 hover:border-bright hover:text-bright"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" fillRule="evenodd" aria-hidden><path d={SOCIAL[k][1]} /></svg></a></li>
              ))}
            </ul>
          ) : null}
        </div>
        <nav aria-label="Quick links">
          <h3 className={h}>Quick Links</h3>
          <ul>{[["Home", "/"], ["Services", "/services"], ["Testimonials", "/testimonials"], ["Booking", "/booking"], ["Contact", "/contact"]].map(([t, u]) => <li key={u}><Link className={a} href={u}>{t}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Our services">
          <h3 className={h}>Our Services</h3>
          <ul>{services.map((v) => <li key={v.slug}><Link className={a} href={`/services#${v.slug}`}>{v.title}</Link></li>)}</ul>
        </nav>
        <div>
          <h3 className={h}>Contact Information</h3>
          <ul className="mb-6">
            <li className="flex min-h-9 items-center gap-3"><User size={18} className="text-bright" aria-hidden />{s.contactPerson}</li>
            <li><a className={a + " gap-3"} href={telHref(s.phone)}><Phone size={18} className="text-bright" aria-hidden />{s.phone}</a></li>
            <li><a className={a + " gap-3 break-all"} href={`mailto:${s.email}`}><Mail size={18} className="shrink-0 text-bright" aria-hidden />{s.email}</a></li>
            {s.businessHours ? <li className="flex min-h-9 items-center gap-3"><Clock size={18} className="shrink-0 text-bright" aria-hidden />{s.businessHours}</li> : null}
            {s.businessAddress ? <li className="flex min-h-9 items-center gap-3"><MapPin size={18} className="shrink-0 text-bright" aria-hidden />{s.businessAddress}</li> : null}
          </ul>
          <Button asChild><Link href="/booking?type=estimate">{s.estimateLabel}</Link></Button>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="wrap flex flex-col items-center justify-between gap-4 py-6 text-center text-sm md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} {s.businessName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <Link className={a} href="/privacy-policy">Privacy Policy</Link>
            <Link className={a} href="/terms-and-conditions">Terms and Conditions</Link>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
