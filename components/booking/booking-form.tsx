"use client";
import { useEffect, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Consent, Done, Honeypot, PrivacyText, SubmitButton } from "@/components/forms/parts";
import { usePublicForm } from "@/hooks/use-public-form";
import { api } from "@/lib/api";
import { BUDGETS, CONTACT_METHODS, REQUEST_TYPES, SERVICE_OPTIONS } from "@/lib/constants";
import { defaultAvailability } from "@/lib/defaults";
import { todayIn, weekdayOf } from "@/lib/utils";
import type { BookingInput } from "@/validators/forms";

type Avail = { weekdays: number[]; timeSlots: string[]; blockedDates: string[]; min: string; max: string };
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function BookingForm() {
  const f = usePublicForm<BookingInput, { reference: string }>(() => import("@/validators/forms").then((m) => m.bookingSchema), "/api/bookings", {
    requestType: "Consultation", fullName: "", email: "", phone: "", address: "", city: "", zip: "", service: "" as never, preferredDate: "", preferredTime: "", budget: "", description: "", contactMethod: "" as never, consent: false, website: "",
  });
  const [a, setA] = useState<Avail | null>(null);
  const { setValue, setError, clearErrors } = f;
  useEffect(() => {
    const fallback = () => ({ ...defaultAvailability, min: todayIn(defaultAvailability.timeZone, 1), max: todayIn(defaultAvailability.timeZone, defaultAvailability.maxDaysAhead) });
    api<Avail>("/api/bookings/availability").then(setA).catch(() => setA(fallback()));
    const q = new URLSearchParams(window.location.search);
    if (q.get("type") === "estimate") setValue("requestType", "Free Estimate");
    const s = SERVICE_OPTIONS.find((o) => o === q.get("service"));
    if (s) setValue("service", s);
  }, [setValue]);

  const checkDate = (d: string) => {
    if (!a || !d) return;
    const msg = d < a.min ? "Choose an upcoming date" : d > a.max ? "Choose a date closer to today" : a.blockedDates.includes(d) ? "That date is not available" : !a.weekdays.includes(weekdayOf(d)) ? `We are not available on ${DAYS[weekdayOf(d)]}s` : "";
    if (msg) setError("preferredDate", { message: msg }); else clearErrors("preferredDate");
  };
  if (f.result) return (
    <Done title="Request received" again="Make another request" onAgain={f.clear}>
      <p>Your reference is</p><p className="my-3 font-btn text-2xl font-extrabold tracking-wide text-royal">{f.result.reference}</p>
      <p>Your preferred time is <strong>not confirmed yet</strong>. We will review your project and contact you to confirm.</p>
    </Done>
  );
  const select = (opts: readonly string[], ph: string) => <><option value="">{ph}</option>{opts.map((o) => <option key={o}>{o}</option>)}</>;
  return (
    <form noValidate onSubmit={f.submit} className="card relative grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold">What would you like to request?</legend>
        <div className="grid gap-3 xs:grid-cols-2">
          {REQUEST_TYPES.map((t) => <label key={t} className="flex min-h-13 cursor-pointer items-center gap-3 rounded-lg border border-[#8b9bad] px-4 font-semibold has-checked:border-primary has-checked:bg-[#eaf4fd] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bright"><input type="radio" value={t} className="size-5 accent-[#0754B8]" {...f.register("requestType")} />{t}</label>)}
        </div>
      </fieldset>
      <Field label="Full Name" error={f.err("fullName")}><Input autoComplete="name" {...f.register("fullName")} /></Field>
      <Field label="Email Address" error={f.err("email")}><Input type="email" autoComplete="email" {...f.register("email")} /></Field>
      <Field label="Phone Number" error={f.err("phone")}><Input type="tel" autoComplete="tel" {...f.register("phone")} /></Field>
      <Field label="Preferred Contact Method" error={f.err("contactMethod")}><Select {...f.register("contactMethod")}>{select(CONTACT_METHODS, "Choose a method")}</Select></Field>
      <Field label="Property Address" error={f.err("address")} className="sm:col-span-2"><Input autoComplete="street-address" {...f.register("address")} /></Field>
      <Field label="City" error={f.err("city")}><Input autoComplete="address-level2" {...f.register("city")} /></Field>
      <Field label="ZIP Code" error={f.err("zip")}><Input inputMode="numeric" autoComplete="postal-code" maxLength={10} {...f.register("zip")} /></Field>
      <Field label="Service Required" error={f.err("service")}><Select {...f.register("service")}>{select(SERVICE_OPTIONS, "Choose a service")}</Select></Field>
      <Field label="Estimated Budget" optional error={f.err("budget")}><Select {...f.register("budget")}>{select(BUDGETS, "Choose a range")}</Select></Field>
      <Field label="Preferred Date" error={f.err("preferredDate")}><Input type="date" min={a?.min} max={a?.max} {...f.register("preferredDate", { onChange: (e) => checkDate(e.target.value) })} /></Field>
      <Field label="Preferred Time" error={f.err("preferredTime")}><Select disabled={!a} {...f.register("preferredTime")}>{select(a?.timeSlots ?? [], a ? "Choose a time" : "Loading times...")}</Select></Field>
      <Field label="Project Description" error={f.err("description")} className="sm:col-span-2"><Textarea rows={5} maxLength={3000} placeholder="Tell us about the space and what you would like to change" {...f.register("description")} /></Field>
      <div className="sm:col-span-2"><Consent error={f.err("consent")} {...f.register("consent")}><PrivacyText /></Consent></div>
      <Honeypot {...f.register("website")} />
      <div className="sm:col-span-2"><SubmitButton busy={f.busy}>Submit Request</SubmitButton></div>
    </form>
  );
}
