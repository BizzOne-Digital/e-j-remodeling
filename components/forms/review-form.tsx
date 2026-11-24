"use client";
import { Star } from "lucide-react";
import { Controller } from "react-hook-form";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { usePublicForm } from "@/hooks/use-public-form";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReviewInput } from "@/validators/forms";
import { Consent, Done, Honeypot, SubmitButton } from "./parts";

export function ReviewForm() {
  const f = usePublicForm<ReviewInput>(() => import("@/validators/forms").then((m) => m.reviewSchema), "/api/testimonials", { fullName: "", email: "", message: "", rating: 0, consent: false, website: "", service: "" as never });
  if (f.result) return <Done title="Thank you for your review" again="Write another review" onAgain={f.clear}>We have received your feedback. It will appear here once it has been approved.</Done>;
  return (
    <form noValidate onSubmit={f.submit} className="card relative grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
      <Field label="Full Name" error={f.err("fullName")}><Input autoComplete="name" {...f.register("fullName")} /></Field>
      <Field label="Email Address" error={f.err("email")} hint="Never published"><Input type="email" autoComplete="email" {...f.register("email")} /></Field>
      <Field label="Service Received" error={f.err("service")}><Select {...f.register("service")}><option value="">Choose a service</option>{SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
      <Controller control={f.control} name="rating" render={({ field }) => (
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Rating</legend>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="grid size-12 cursor-pointer place-items-center rounded-lg has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bright">
                <input ref={n === 1 ? field.ref : undefined} type="radio" name="rating" value={n} checked={field.value === n} onChange={() => field.onChange(n)} className="sr-only" aria-label={`${n} star${n > 1 ? "s" : ""}`} />
                <Star size={30} aria-hidden className={cn("transition", n <= field.value ? "fill-primary text-primary" : "text-[#8b9bad]")} />
              </label>
            ))}
          </div>
          {f.err("rating") ? <p role="alert" className="mt-1 text-sm font-medium text-red-700">Choose a rating</p> : null}
        </fieldset>
      )} />
      <Field label="Your Review" error={f.err("message")} className="sm:col-span-2"><Textarea rows={5} maxLength={2000} {...f.register("message")} /></Field>
      <div className="sm:col-span-2"><Consent error={f.err("consent")} {...f.register("consent")}>I agree that my name, rating, and review may be published on this website.</Consent></div>
      <Honeypot {...f.register("website")} />
      <div className="sm:col-span-2"><SubmitButton busy={f.busy}>Submit Review</SubmitButton></div>
    </form>
  );
}
