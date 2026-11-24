"use client";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, telHref } from "@/lib/utils";
import type { Settings } from "@/lib/defaults";

type Props = { settings: Settings; services: { title: string; slug: string }[]; nav: readonly (readonly [string, string])[]; active: (href: string) => boolean; onClose: () => void };
/** Loaded only when the menu is first opened. */
export default function MobileDrawer({ settings: s, services, nav, active, onClose }: Props) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/70 [animation:fade_.25s]" />
              <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 right-0 z-[81] flex w-[min(90vw,380px)] flex-col overflow-y-auto bg-night p-5 text-white shadow-2xl [animation:slide-in_.28s_cubic-bezier(.2,.7,.2,1)]">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="sr-only">Menu</Dialog.Title>
                  <Image src="/images/logo-mark.png" alt="" width={770} height={470} className="h-auto w-24" />
                  <Dialog.Close aria-label="Close menu" className="grid size-12 place-items-center rounded-lg border border-white/25"><X size={24} /></Dialog.Close>
                </div>
                <nav aria-label="Mobile" className="mt-5 flex flex-col">
                  {nav.map(([label, href]) => (
                    <div key={href} className="border-b border-white/10">
                      <Link href={href} onClick={onClose} aria-current={active(href) ? "page" : undefined} className={cn("flex min-h-13 items-center text-lg font-medium", active(href) && "text-bright")}>{label}</Link>
                      {label === "Services" ? (
                        <ul className="grid grid-cols-2 pb-3">
                          {services.map((v) => <li key={v.slug}><Link href={`/services#${v.slug}`} onClick={onClose} className="flex min-h-11 items-center text-silver">{v.title}</Link></li>)}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </nav>
                <div className="mt-7 grid gap-3">
                  <Button asChild><Link href="/booking" onClick={onClose}><CalendarDays size={19} aria-hidden />{s.consultationLabel}</Link></Button>
                  <Button asChild variant="outline"><a href={telHref(s.phone)}><Phone size={18} aria-hidden />{s.phone}</a></Button>
                  <a href={`mailto:${s.email}`} className="flex min-h-11 items-center justify-center gap-2 text-silver"><Mail size={18} aria-hidden />{s.email}</a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
    </Dialog.Root>
  );
}
