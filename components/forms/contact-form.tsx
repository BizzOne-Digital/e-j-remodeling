"use client";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { usePublicForm } from "@/hooks/use-public-form";
import { SERVICE_OPTIONS } from "@/lib/constants";
import type { ContactInput } from "@/validators/forms";
import { Consent, Done, Honeypot, PrivacyText, SubmitButton } from "./parts";

export function ContactForm() {
  const f = usePublicForm<ContactInput>(() => import("@/validators/forms").then((m) => m.contactSchema), "/api/contact", { fullName: "", email: "", phone: "", subject: "", message: "", consent: false, website: "", service: "" as never });
  if (f.result) return <Done title="Message sent" again="Send another message" onAgain={f.clear}>Thank you for reaching out. We have received your message and will get back to you.</Done>;
  return (
    <form noValidate onSubmit={f.submit} className="card relative grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
      <Field label="Full Name" error={f.err("fullName")}><Input autoComplete="name" {...f.register("fullName")} /></Field>
      <Field label="Email" error={f.err("email")}><Input type="email" autoComplete="email" {...f.register("email")} /></Field>
      <Field label="Phone" error={f.err("phone")}><Input type="tel" autoComplete="tel" {...f.register("phone")} /></Field>
      <Field label="Service of Interest" error={f.err("service")}><Select {...f.register("service")}><option value="">Choose a service</option>{SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
      <Field label="Subject" error={f.err("subject")} className="sm:col-span-2"><Input {...f.register("subject")} /></Field>
      <Field label="Message" error={f.err("message")} className="sm:col-span-2"><Textarea rows={6} maxLength={3000} {...f.register("message")} /></Field>
      <div className="sm:col-span-2"><Consent error={f.err("consent")} {...f.register("consent")}><PrivacyText /></Consent></div>
      <Honeypot {...f.register("website")} />
      <div className="sm:col-span-2"><SubmitButton busy={f.busy}>Send Message</SubmitButton></div>
    </form>
  );
}
