"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const base = "w-full rounded-lg border border-[#8b9bad] bg-white px-3.5 text-base text-dark placeholder:text-muted/80 transition focus:border-primary focus:outline-none focus:ring-3 focus:ring-bright/30 aria-invalid:border-red-700 disabled:bg-mist";
export const Input = ({ className, ...p }: React.ComponentProps<"input">) => <input className={cn(base, "h-12", className)} {...p} />;
export const Textarea = ({ className, ...p }: React.ComponentProps<"textarea">) => <textarea className={cn(base, "min-h-28 py-3", className)} {...p} />;
export const Select = ({ className, ...p }: React.ComponentProps<"select">) => <select className={cn(base, "h-12", className)} {...p} />;

/** Label + control + error message, wired for assistive tech. */
export function Field({ label, error, hint, optional, className, children }: { label: string; error?: string; hint?: string; optional?: boolean; className?: string; children: React.ReactElement<Record<string, unknown>> }) {
  const id = React.useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-dark">
        {label} {optional ? <span className="font-normal text-muted">(optional)</span> : null}
      </label>
      {React.cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? `${id}-msg` : undefined })}
      {error ? <p id={`${id}-msg`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">{error}</p> : hint ? <p id={`${id}-msg`} className="mt-1.5 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
