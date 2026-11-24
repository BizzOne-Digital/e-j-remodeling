"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, CalendarRange, CircleHelp, CreditCard, ExternalLink, Hammer, House, Images, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Settings, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [["Dashboard", "dashboard", LayoutDashboard], ["Bookings", "bookings", CalendarDays], ["Availability", "availability", CalendarRange], ["Inquiries", "inquiries", Mail], ["Payments", "payments", CreditCard], ["Testimonials", "testimonials", MessageSquareQuote], ["Homepage & Pages", "homepage", House], ["Services", "services", Hammer], ["Gallery", "gallery", Images], ["FAQs", "faqs", CircleHelp], ["Settings", "settings", Settings], ["Account", "account", UserCog]] as const;

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  async function out() {
    try { await api("/api/auth/logout", { method: "POST" }); window.location.replace("/admin/login"); } catch (e) { toast.error((e as Error).message); }
  }
  const row = "flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-[.95rem] font-medium transition";
  const menu = (
    <>
      <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="block"><Image src="/images/logo.png" alt="E&J admin home" width={1200} height={400} className="h-auto w-56" /></Link>
      <nav aria-label="Admin" className="mt-2 grid gap-1">
        {NAV.map(([label, slug, I]) => {
          const on = path === `/admin/${slug}`;
          return <Link key={slug} href={`/admin/${slug}`} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} className={cn(row, on ? "grad text-white" : "text-silver hover:bg-white/10 hover:text-white")}><I size={19} aria-hidden />{label}</Link>;
        })}
      </nav>
      <div className="mt-auto border-t border-white/15 pt-4">
        <a href="/" target="_blank" className={cn(row, "text-silver hover:bg-white/10")}><ExternalLink size={19} aria-hidden />View website</a>
        <button type="button" onClick={out} className={cn(row, "text-silver hover:bg-white/10")}><LogOut size={19} aria-hidden />Sign out</button>
        <p className="truncate px-3.5 pt-2 text-xs text-silver/80">{email}</p>
      </div>
    </>
  );
  return (
    <div className="min-h-dvh bg-mist lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto bg-ink p-4 lg:flex">{menu}</aside>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Image src="/images/logo-mark.png" alt="E&J admin" width={770} height={470} className="h-11 w-auto" />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger aria-label="Open menu" className="grid size-12 place-items-center"><Menu /></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70" />
            <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col overflow-y-auto bg-ink p-4 text-white"><Dialog.Title className="sr-only">Admin menu</Dialog.Title><Dialog.Close aria-label="Close menu" className="grid size-11 place-items-center self-end"><X /></Dialog.Close>{menu}</Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
    </div>
  );
}
export const Title = ({ children, text, action }: { children: React.ReactNode; text?: string; action?: React.ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-sans text-2xl font-bold sm:text-3xl">{children}</h1>{text ? <p className="mt-1.5 max-w-2xl text-muted">{text}</p> : null}</div>{action}</div>
);
const TONE: Record<string, string> = { Pending: "bg-amber-100 text-amber-900", New: "bg-amber-100 text-amber-900", Unpaid: "bg-amber-100 text-amber-900", Confirmed: "bg-sky-100 text-sky-900", "In Progress": "bg-sky-100 text-sky-900", Completed: "bg-emerald-100 text-emerald-900", Approved: "bg-emerald-100 text-emerald-900", Paid: "bg-emerald-100 text-emerald-900", Resolved: "bg-emerald-100 text-emerald-900", Failed: "bg-red-100 text-red-900", Rejected: "bg-red-100 text-red-900", Cancelled: "bg-red-100 text-red-900" };
export const Badge = ({ children }: { children: string }) => <span className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold", TONE[children] ?? "bg-slate-200 text-slate-800")}>{children}</span>;
