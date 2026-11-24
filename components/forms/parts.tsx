"use client";
import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Honeypot = (p: React.ComponentProps<"input">) => (
  <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden"><label>Leave this empty<input tabIndex={-1} autoComplete="off" {...p} /></label></div>
);
export function Consent({ error, children, ...p }: React.ComponentProps<"input"> & { error?: string }) {
  const id = useId();
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 py-1 text-sm leading-relaxed">
        <input type="checkbox" className="mt-0.5 size-6 shrink-0 accent-[#0754B8]" aria-invalid={error ? true : undefined} aria-describedby={error ? id : undefined} {...p} /><span>{children}</span>
      </label>
      {error ? <p id={id} role="alert" className="mt-1 text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
export const PrivacyText = () => <>I agree to be contacted about my request and accept the <Link href="/privacy-policy" target="_blank" className="font-semibold text-royal underline">Privacy Policy</Link>.</>;
export const SubmitButton = ({ busy, children }: { busy: boolean; children: React.ReactNode }) => (
  <Button type="submit" size="lg" disabled={busy} aria-busy={busy} className="w-full sm:w-auto">{busy ? <><LoaderCircle size={20} className="animate-spin" aria-hidden />Sending...</> : children}</Button>
);
export function Done({ title, children, again, onAgain }: { title: string; children: React.ReactNode; again: string; onAgain: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.scrollIntoView({ block: "center" }); }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="card p-8 text-center outline-none sm:p-12">
      <CheckCircle2 size={56} strokeWidth={1.400} className="mx-auto text-primary" aria-hidden />
      <h2 className="mt-4 text-2xl sm:text-3xl">{title}</h2>
      <div className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-[#475467]">{children}</div>
      <Button variant="light" className="mt-7" onClick={onAgain}>{again}</Button>
    </div>
  );
}
