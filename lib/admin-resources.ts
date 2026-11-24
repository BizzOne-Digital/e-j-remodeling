import "server-only";
import { z } from "zod";
import type { Model } from "mongoose";
import { Booking, ContactInquiry, FAQ, GalleryImage, Payment, Service, Testimonial } from "@/models";
import { BOOKING_STATUSES, GALLERY_KINDS, ICON_KEYS, INQUIRY_STATUSES, PAYMENT_TYPES, REVIEW_STATUSES } from "./constants";
import { imageUrl } from "@/validators/shape";
import { HttpError } from "./http";
import { makeRef, makeToken } from "./refs";
import { isStripeConfigured, stripe } from "./payments";

const s = (max: number, min = 0) => z.string().trim().min(min, "Required").max(max);
const notes = s(5000);
const list = z.array(s(200, 1)).max(20);
const common = { order: z.number().int().optional(), published: z.boolean() };

type Data = Record<string, unknown>;
type Resource = {
  model: Model<never>; search: string[]; sort: Record<string, 1 | -1>; filters: string[]; public: boolean; canDelete: boolean; ordered?: boolean;
  create?: z.ZodType; update: z.ZodType; hide?: string;
  beforeCreate?: (d: Data) => Data | Promise<Data>; beforeUpdate?: (cur: Data, d: Data) => Data | Promise<Data>;
};
const m = (x: unknown) => x as Model<never>;

const service = z.object({ title: s(80, 1), slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens").max(60), shortDescription: s(300, 1), description: s(3000), icon: z.enum(ICON_KEYS), image: imageUrl, benefits: list, options: list, ...common });
const faq = z.object({ question: s(300, 1), answer: s(3000, 1), ...common });
const gallery = z.object({ title: s(150, 1), description: s(600), category: s(60, 1), kind: z.enum(GALLERY_KINDS), image: imageUrl, beforeImage: imageUrl, afterImage: imageUrl, ...common });
const checkGallery = (d: Data) => {
  if (!d.image && !(d.beforeImage && d.afterImage)) throw new HttpError(400, "Add an image, or both a before and an after image.");
  if (Boolean(d.beforeImage) !== Boolean(d.afterImage)) throw new HttpError(400, "A comparison needs both a before and an after image.");
  if (d.beforeImage && d.kind !== "project") throw new HttpError(400, "Before-and-after pairs must be genuine: set the type to Completed project.");
  return d;
};
const payment = z.object({ type: z.enum(PAYMENT_TYPES), description: s(400), customerName: s(120, 1), customerEmail: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  bookingReference: s(20), amount: z.number("Enter an amount").min(0.5, "Minimum is $0.50").max(999_999.99), adminNotes: notes.optional() });

export const resources: Record<string, Resource> = {
  services: { model: m(Service), search: ["title", "shortDescription"], sort: { order: 1 }, filters: ["published"], public: true, canDelete: true, ordered: true, create: service, update: service },
  faqs: { model: m(FAQ), search: ["question", "answer"], sort: { order: 1 }, filters: ["published"], public: true, canDelete: true, ordered: true, create: faq, update: faq },
  gallery: { model: m(GalleryImage), search: ["title", "category"], sort: { order: 1 }, filters: ["category", "kind", "published"], public: true, canDelete: true, ordered: true, create: gallery, update: gallery,
    beforeCreate: checkGallery, beforeUpdate: (_c, d) => checkGallery(d) },
  bookings: { model: m(Booking), search: ["reference", "fullName", "email", "phone", "city"], sort: { createdAt: -1 }, filters: ["status", "service"], public: false, canDelete: true,
    update: z.object({ status: z.enum(BOOKING_STATUSES), preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"), preferredTime: s(60, 1), adminNotes: notes }) },
  inquiries: { model: m(ContactInquiry), search: ["fullName", "email", "phone", "subject", "message"], sort: { createdAt: -1 }, filters: ["status", "read"], public: false, canDelete: true,
    update: z.object({ status: z.enum(INQUIRY_STATUSES).optional(), read: z.boolean().optional(), adminNotes: notes.optional() }) },
  testimonials: { model: m(Testimonial), search: ["fullName", "message", "service"], sort: { createdAt: -1 }, filters: ["status", "published"], public: true, canDelete: true,
    update: z.object({ status: z.enum(REVIEW_STATUSES), published: z.boolean(), message: s(2000, 1), image: imageUrl }),
    beforeUpdate: (cur, d) => {
      if (d.published && d.status !== "Approved") throw new HttpError(400, "Approve the review before publishing it.");
      if (d.published && !cur.consent) throw new HttpError(400, "The customer did not consent to publication.");
      return d;
    } },
  payments: { model: m(Payment), search: ["reference", "customerName", "customerEmail", "bookingReference", "stripePaymentIntentId", "stripeSessionId"], sort: { createdAt: -1 }, filters: ["status", "type"], public: false, canDelete: false,
    create: payment,
    update: z.object({ action: z.enum(["cancel"]).optional(), adminNotes: notes.optional() }),
    beforeCreate: async ({ amount, ...d }) => {
      if (d.bookingReference && !(await Booking.exists({ reference: String(d.bookingReference) }))) throw new HttpError(400, "No booking has that reference.");
      return { ...d, amountCents: Math.round(Number(amount) * 100), reference: makeRef("PAY"), token: makeToken() };
    },
    beforeUpdate: async (cur, { action, ...d }) => {
      if (action !== "cancel") return d;
      if (!["Unpaid", "Pending", "Failed"].includes(String(cur.status))) throw new HttpError(409, `A ${String(cur.status).toLowerCase()} payment cannot be cancelled.`);
      if (cur.stripeSessionId && isStripeConfigured()) {
        const sess = await stripe().checkout.sessions.retrieve(String(cur.stripeSessionId));
        if (sess.status === "complete") throw new HttpError(409, "The customer has already submitted this payment.");
        if (sess.status === "open") await stripe().checkout.sessions.expire(sess.id);
      }
      // Conditional, so a webhook that just marked it Paid always wins.
      const r = await Payment.updateOne({ _id: String(cur._id), status: { $in: ["Unpaid", "Pending", "Failed"] } }, { $set: { status: "Cancelled" } });
      if (!r.matchedCount) throw new HttpError(409, "This payment has just changed. Reload and try again.");
      return d;
    } },
};
const esc = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function resourceFor(name: string) {
  const r = Object.hasOwn(resources, name) ? resources[name] : undefined;
  if (!r) throw new HttpError(404, "Not found.");
  return r;
}
/** Builds a filter from whitelisted query-string keys; every value is a plain string, boolean, escaped regex or date. */
export function filterFrom(r: Resource, q: URLSearchParams) {
  const f: Data = {};
  const term = q.get("q")?.trim().slice(0, 80);
  if (term) f.$or = r.search.map((k) => ({ [k]: { $regex: esc(term), $options: "i" } }));
  for (const k of r.filters) { const v = q.get(k); if (v) f[k] = ["published", "read"].includes(k) ? v === "true" : v.slice(0, 80); }
  const day = (v: string | null, end: boolean) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + (end ? "T23:59:59.999Z" : "T00:00:00Z")) : null);
  const from = day(q.get("from"), false), to = day(q.get("to"), true);
  if (from || to) f.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  return f;
}
