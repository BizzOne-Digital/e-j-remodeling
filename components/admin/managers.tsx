"use client";
import Link from "next/link";
import { Copy, Download, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResourceManager, type Config, type Row } from "./resource-manager";
import { Badge } from "./shell";
import { api } from "@/lib/api";
import { BOOKING_STATUSES, GALLERY_KINDS, ICON_KEYS, INQUIRY_STATUSES, PAYMENT_STATUSES, PAYMENT_TYPES, REVIEW_STATUSES, SERVICE_OPTIONS } from "@/lib/constants";
import { formatDate, money, telHref } from "@/lib/utils";

const opts = (a: readonly string[]) => a.map((x) => [x, x] as const);
const PUB = { key: "published", label: "Visibility", options: [["true", "Published"], ["false", "Hidden"]] } as const;
const vis = { label: "Visibility", render: (r: Row) => <Badge>{r.published ? "Published" : "Hidden"}</Badge> };
const CATS = ["Kitchens", "Bathrooms", "Cabinets", "Showers", "Flooring"];
// eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
const thumb = (src: string) => (src ? <img src={src} alt="" loading="lazy" className="h-12 w-16 rounded object-cover" /> : null);
const Details = ({ rows }: { rows: [string, React.ReactNode][] }) => (
  <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-mist p-4 text-[.95rem] sm:grid-cols-2">{rows.filter((r) => r[1]).map(([k, v]) => <div key={k} className={["Project", "Message", "Original review", "Payment link"].includes(k) ? "sm:col-span-2" : ""}><dt className="text-sm text-muted">{k}</dt><dd className="font-medium break-words whitespace-pre-line">{v}</dd></div>)}</dl>
);
const contact = (r: Row): [string, React.ReactNode][] => [["Name", r.fullName], ["Phone", r.phone ? <a key="p" className="text-royal underline" href={telHref(r.phone)}>{r.phone}</a> : null], ["Email", <a key="e" className="text-royal underline" href={`mailto:${r.email}`}>{r.email}</a>]];

const CONFIGS = {
  bookings: {
    resource: "bookings", title: "Bookings", noun: "booking", canDelete: true,
    columns: [{ label: "Reference", render: (r) => <><strong>{r.reference}</strong><span className="block text-sm text-muted">{r.requestType}</span></> }, { label: "Customer", render: (r) => <>{r.fullName}<span className="block text-sm text-muted">{r.phone}</span></> }, { label: "Service", render: (r) => r.service }, { label: "Preferred", render: (r) => <>{formatDate(r.preferredDate)}<span className="block text-sm text-muted">{r.preferredTime}</span></> }, { label: "Status", render: (r) => <Badge>{r.status}</Badge> }],
    filters: [{ key: "status", label: "Status", options: opts(BOOKING_STATUSES) }, { key: "service", label: "Service", options: opts(SERVICE_OPTIONS) }],
    fields: [{ key: "status", label: "Status", type: "select", options: BOOKING_STATUSES }, { key: "preferredDate", label: "Appointment date (change to reschedule)", type: "date" }, { key: "preferredTime", label: "Appointment time" }, { key: "adminNotes", label: "Private notes", type: "textarea" }],
    detail: (r) => <>
      <Details rows={[["Reference", r.reference], ["Received", formatDate(r.createdAt)], ...contact(r), ["Contact by", r.contactMethod], ["Address", `${r.address}, ${r.city} ${r.zip}`], ["Service", r.service], ["Budget", r.budget], ["Project", r.description]]} />
      <Button asChild variant="light" size="sm"><Link href={`/admin/payments?${new URLSearchParams({ booking: r.reference, name: r.fullName, email: r.email })}`}>Create payment request</Link></Button>
    </>,
  },
  inquiries: {
    resource: "inquiries", title: "Contact Inquiries", noun: "inquiry", canDelete: true,
    columns: [{ label: "From", render: (r) => <span className={r.read ? "" : "font-bold"}>{r.fullName}<span className="block text-sm font-normal text-muted">{r.email}</span></span> }, { label: "Subject", render: (r) => <span className={r.read ? "" : "font-bold"}>{r.subject}</span> }, { label: "Received", render: (r) => formatDate(r.createdAt) }, { label: "Read", render: (r) => <Badge>{r.read ? "Read" : "Unread"}</Badge> }, { label: "Status", render: (r) => <Badge>{r.status}</Badge> }],
    filters: [{ key: "status", label: "Status", options: opts(INQUIRY_STATUSES) }, { key: "read", label: "Read", options: [["true", "Read"], ["false", "Unread"]] }],
    fields: [{ key: "status", label: "Status", type: "select", options: INQUIRY_STATUSES }, { key: "read", label: "Marked as read", type: "bool" }, { key: "adminNotes", label: "Private notes", type: "textarea" }],
    detail: (r) => <Details rows={[...contact(r), ["Service", r.service], ["Subject", r.subject], ["Received", formatDate(r.createdAt)], ["Message", r.message]]} />,
  },
  testimonials: {
    resource: "testimonials", title: "Testimonials", noun: "review", canDelete: true, text: "Reviews stay private until you approve and publish them. Edit only formatting or typos; the customer's original wording is kept below for reference.",
    columns: [{ label: "Customer", render: (r) => r.fullName }, { label: "Rating", render: (r) => <span className="inline-flex items-center gap-1 font-semibold">{r.rating}<Star size={16} className="fill-primary text-primary" aria-label="stars" /></span> }, { label: "Review", render: (r) => <span className="line-clamp-2">{r.message}</span> }, { label: "Status", render: (r) => <Badge>{r.status}</Badge> }, vis],
    filters: [{ key: "status", label: "Status", options: opts(REVIEW_STATUSES) }, PUB],
    fields: [{ key: "status", label: "Status", type: "select", options: REVIEW_STATUSES }, { key: "published", label: "Published on the website", type: "bool" }, { key: "message", label: "Displayed review", type: "textarea" }, { key: "image", label: "Customer image (optional)", type: "image", folder: "misc" }],
    detail: (r) => <Details rows={[...contact(r), ["Service", r.service], ["Consent to publish", r.consent ? "Yes" : "No"], ["Original review", r.originalMessage]]} />,
  },
  services: {
    resource: "services", title: "Services", noun: "service", canCreate: true, canDelete: true, ordered: true,
    columns: [{ label: "Image", render: (r) => thumb(r.image) }, { label: "Service", render: (r) => <strong>{r.title}</strong> }, { label: "Link", render: (r) => `#${r.slug}` }, vis], filters: [PUB],
    blank: { title: "", slug: "", shortDescription: "", description: "", icon: "wrench", image: "", benefits: [], options: [], published: true },
    fields: [{ key: "title", label: "Title" }, { key: "slug", label: "Slug", hint: "Used in links, for example: shower-upgrades" }, { key: "shortDescription", label: "Short description", type: "textarea" }, { key: "description", label: "Detailed description", type: "textarea" }, { key: "icon", label: "Icon", type: "select", options: ICON_KEYS }, { key: "image", label: "Cover image", type: "image", folder: "services" }, { key: "benefits", label: "Key benefits", type: "lines" }, { key: "options", label: "Related improvements", type: "lines" }, { key: "published", label: "Published", type: "bool" }],
  },
  gallery: {
    resource: "gallery", title: "Gallery", noun: "gallery entry", canCreate: true, canDelete: true, ordered: true, text: "Mark stock photos as inspiration. Use “project” only for genuine E&J work. Add both a before and an after image to show a comparison slider.",
    columns: [{ label: "Image", render: (r) => thumb(r.image || r.afterImage) }, { label: "Title", render: (r) => <strong>{r.title}</strong> }, { label: "Category", render: (r) => r.category }, { label: "Type", render: (r) => <Badge>{r.beforeImage ? "Before / after" : r.kind === "project" ? "Project" : "Inspiration"}</Badge> }, vis],
    filters: [{ key: "category", label: "Category", options: opts(CATS) }, { key: "kind", label: "Type", options: opts(GALLERY_KINDS) }, PUB],
    blank: { title: "", description: "", category: "Kitchens", kind: "inspiration", image: "", beforeImage: "", afterImage: "", published: true },
    fields: [{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea" }, { key: "category", label: "Category", type: "combo", options: CATS, hint: "Choose one or type a new category" }, { key: "kind", label: "Type", type: "select", options: GALLERY_KINDS }, { key: "image", label: "Image", type: "image", folder: "gallery" }, { key: "beforeImage", label: "Before image (optional)", type: "image", folder: "gallery" }, { key: "afterImage", label: "After image (optional)", type: "image", folder: "gallery" }, { key: "published", label: "Published", type: "bool" }],
  },
  faqs: {
    resource: "faqs", title: "FAQs", noun: "question", canCreate: true, canDelete: true, ordered: true,
    columns: [{ label: "Question", render: (r) => <strong>{r.question}</strong> }, vis], filters: [PUB], blank: { question: "", answer: "", published: true },
    fields: [{ key: "question", label: "Question" }, { key: "answer", label: "Answer", type: "textarea" }, { key: "published", label: "Published", type: "bool" }],
  },
  payments: {
    resource: "payments", title: "Payments", noun: "payment request", canCreate: true, dates: true, text: "Create a request for an agreed amount, then send the customer its secure link. Statuses update from Stripe.",
    columns: [{ label: "Reference", render: (r) => <><strong>{r.reference}</strong><span className="block text-sm text-muted">{r.type}</span></> }, { label: "Customer", render: (r) => <>{r.customerName}<span className="block text-sm text-muted">{r.bookingReference || r.customerEmail}</span></> }, { label: "Amount", render: (r) => <strong>{money(r.amountCents, r.currency)}</strong> }, { label: "Created", render: (r) => formatDate(r.createdAt) }, { label: "Status", render: (r) => <Badge>{r.status}</Badge> }],
    filters: [{ key: "status", label: "Status", options: opts(PAYMENT_STATUSES) }, { key: "type", label: "Type", options: opts(PAYMENT_TYPES) }],
    blank: { type: PAYMENT_TYPES[0], description: "", customerName: "", customerEmail: "", bookingReference: "", amount: "" },
    initial: () => { const q = new URLSearchParams(window.location.search); return q.get("booking") ? { type: PAYMENT_TYPES[0], description: "", customerName: q.get("name") ?? "", customerEmail: q.get("email") ?? "", bookingReference: q.get("booking"), amount: "" } : null; },
    fields: [{ key: "type", label: "Payment type", type: "select", options: PAYMENT_TYPES, createOnly: true }, { key: "amount", label: "Agreed amount (USD)", type: "money", createOnly: true }, { key: "customerName", label: "Customer name", createOnly: true }, { key: "customerEmail", label: "Customer email", createOnly: true }, { key: "bookingReference", label: "Booking reference (optional)", createOnly: true }, { key: "description", label: "Description shown to customer", type: "textarea", createOnly: true }, { key: "adminNotes", label: "Private notes", type: "textarea", editOnly: true }],
    detail: (r, reload, close) => {
      const link = `${window.location.origin}/payment?token=${r.token}`, open = ["Unpaid", "Pending", "Failed"].includes(r.status);
      return <>
        <Details rows={[["Reference", r.reference], ["Status", r.status], ["Amount", money(r.amountCents, r.currency)], ["Refunded", r.refundedCents ? money(r.refundedCents, r.currency) : ""], ["Customer", r.customerName], ["Email", r.customerEmail], ["Booking", r.bookingReference], ["Paid", r.paidAt ? formatDate(r.paidAt) : ""], ["Stripe payment", r.stripePaymentIntentId], ["Stripe session", r.stripeSessionId], ["Description", r.description], ["Payment link", open ? link : ""]]} />
        {open ? <div className="flex flex-wrap gap-3">
          <Button type="button" variant="light" size="sm" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied."), () => toast.error("Could not copy. Select the link above."))}><Copy size={16} aria-hidden />Copy link</Button>
          <Button type="button" variant="danger" size="sm" onClick={async () => { try { await api(`/api/admin/payments/${r._id}`, { method: "PATCH", body: { action: "cancel" } }); toast.success("Payment request cancelled."); close(); } catch (e) { toast.error((e as Error).message); } reload(); }}>Cancel request</Button>
        </div> : null}
      </>;
    },
    extra: (query) => <Button asChild size="sm" variant="light"><a href={`/api/admin/payments/export?${query}`}><Download size={17} aria-hidden />Export CSV</a></Button>,
  },
} satisfies Record<string, Config>;

export function Manager({ name }: { name: keyof typeof CONFIGS }) {
  return <ResourceManager key={name} config={CONFIGS[name] as Config} />;
}
