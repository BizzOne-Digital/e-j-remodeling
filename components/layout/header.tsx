"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronDown, Clock, Mail, MapPin, Menu, Phone, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, telHref } from "@/lib/utils";
import type { Settings } from "@/lib/defaults";

const MobileDrawer = dynamic(() => import("./mobile-drawer"), { ssr: false });
type Link_ = { title: string; slug: string };
const NAV = [["Home", "/"], ["Services", "/services"], ["Testimonials", "/testimonials"], ["Booking", "/booking"], ["Contact", "/contact"]] as const;

export function Header({ settings: s, services }: { settings: Settings; services: Link_[] }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 48);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const top = "flex min-h-11 items-center gap-2.5 whitespace-nowrap";

  return (
    <>
      <div className="border-b border-white/25 bg-ink text-sm font-medium text-white">
        <div className="wrap flex items-center justify-between gap-6">
          <div className="flex items-center gap-x-10">
            <a href={telHref(s.phone)} className={cn(top, "hover:text-bright")}><Phone size={17} className="fill-bright text-bright" aria-hidden />{s.phone}</a>
            <a href={`mailto:${s.email}`} className={cn(top, "hidden hover:text-bright md:flex")}><Mail size={18} className="text-bright" aria-hidden />{s.email}</a>
          </div>
          <div className="flex items-center gap-x-8">
            {s.businessHours ? <span className={cn(top, "hidden lg:flex")}><Clock size={18} className="text-bright" aria-hidden />{s.businessHours}</span> : null}
            {s.serviceAreas ? <span className={cn(top, "hidden max-w-72 xl:flex")}><MapPin size={18} className="shrink-0 text-bright" aria-hidden /><span className="truncate">{s.serviceAreas}</span></span> : null}
            {s.topBarText ? <span className={top}><Tag size={17} className="text-bright" aria-hidden />{s.topBarText}</span> : null}
          </div>
        </div>
      </div>

      <header className={cn("sticky top-0 z-50 text-white transition-colors duration-300", scrolled ? "bg-ink/90 shadow-lg shadow-ink/40 backdrop-blur-md" : "bg-ink")}>
        <div className={cn("wrap flex items-center justify-between gap-5 transition-[height] duration-300", scrolled ? "h-[76px] lg:h-[84px]" : "h-[84px] lg:h-[122px]")}>
          <Link href="/" aria-label={`${s.businessName}, home`} className="block min-w-0 shrink-0">
            <Image src={s.logoImage || "/images/logo.png"} alt={s.businessName} width={1200} height={400} priority sizes="(min-width:1280px) 420px, 300px"
              className={cn("h-auto transition-[width] duration-300", scrolled ? "w-[216px] lg:w-[250px]" : "w-[226px] lg:w-[280px] xl:w-[370px] 2xl:w-[400px]")} />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-5 lg:flex xl:gap-8">
            {NAV.map(([label, href]) =>
              label === "Services" ? <ServicesMenu key={href} active={active(href)} services={services} /> : (
                <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={navCls(active(href))}>{label}</Link>
              ))}
            <Button asChild size="lg" className="ml-1 px-5 xl:ml-2"><Link href="/booking"><CalendarDays size={21} aria-hidden />{s.consultationLabel}</Link></Button>
          </nav>

          <button ref={menuBtn} type="button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={drawer} onClick={() => setDrawer(true)} className="grid size-12 shrink-0 place-items-center rounded-lg border border-white/25 lg:hidden"><Menu size={25} /></button>
          {drawer ? <MobileDrawer settings={s} services={services} nav={NAV} active={active} onClose={() => { setDrawer(false); menuBtn.current?.focus(); }} /> : null}
        </div>
      </header>
    </>
  );
}

const navCls = (on: boolean) => cn(
  "relative flex min-h-11 items-center font-semibold transition-colors hover:text-bright after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:rounded after:bg-bright after:transition-transform after:duration-300",
  on ? "text-bright after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100");

function ServicesMenu({ active, services }: { active: boolean; services: Link_[] }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  return (
    <div ref={box} className="relative flex items-center"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { clearTimeout(timer.current); setOpen(true); } }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") timer.current = setTimeout(() => setOpen(false), 140); }}
      onBlur={(e) => { if (!box.current?.contains(e.relatedTarget)) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === "Escape" && open) { setOpen(false); btn.current?.focus(); } }}>
      <Link href="/services" aria-current={active ? "page" : undefined} className={navCls(active)} onClick={() => setOpen(false)}>Services</Link>
      <button ref={btn} type="button" aria-label="Show services" aria-expanded={open} aria-controls="services-menu" onClick={() => setOpen((o) => !o)} className="grid h-11 w-7 place-items-center">
        <ChevronDown size={17} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div id="services-menu" className={cn("absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-3 transition duration-200", open ? "visible opacity-100" : "invisible translate-y-2 opacity-0")}>
        <ul className="overflow-hidden rounded-xl border border-white/15 bg-night py-2 shadow-2xl">
          {services.map((v) => (
            <li key={v.slug}><Link href={`/services#${v.slug}`} onClick={() => setOpen(false)} className="flex min-h-11 items-center border-l-3 border-transparent px-5 font-medium text-silver transition hover:border-bright hover:bg-navy hover:text-white">{v.title}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
