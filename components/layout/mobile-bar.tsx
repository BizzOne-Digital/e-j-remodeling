"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Phone } from "lucide-react";
import { cn, telHref } from "@/lib/utils";

/** Sticky contact bar for phones. Hidden on form pages and whenever a field has focus, so it never covers inputs. */
export function MobileBar({ phone }: { phone: string }) {
  const path = usePathname();
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const on = (e: FocusEvent) => setTyping(e.type === "focusin" && /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName));
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", on);
    return () => { document.removeEventListener("focusin", on); document.removeEventListener("focusout", on); };
  }, []);
  if (path.startsWith("/booking") || path.startsWith("/payment")) return null;
  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-white/15 bg-ink/95 p-2 pb-[max(.5rem,env(safe-area-inset-bottom))] font-btn font-semibold text-white transition-transform lg:hidden", typing && "invisible translate-y-full")}>
      <a href={telHref(phone)} className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-bright/60"><Phone size={18} aria-hidden />Call Now</a>
      <Link href="/booking?type=estimate" className="grad flex min-h-12 items-center justify-center gap-2 rounded-lg"><ClipboardList size={18} aria-hidden />Free Estimate</Link>
    </div>
  );
}
