import "server-only";
import mongoose, { Schema, type Model } from "mongoose";
import { BOOKING_STATUSES, GALLERY_KINDS, INQUIRY_STATUSES, PAYMENT_STATUSES, PAYMENT_TYPES, REVIEW_STATUSES } from "@/lib/constants";
import type { Availability as AvailabilityShape, FaqItem, GalleryItem, ServiceItem } from "@/lib/defaults";

type Stamped = { createdAt: Date; updatedAt: Date };
function define<T>(name: string, schema: Schema): Model<T & Stamped> {
  return (mongoose.models[name] ?? mongoose.model(name, schema)) as unknown as Model<T & Stamped>;
}
const opts = { timestamps: true, minimize: false } as const;
const req = { type: String, required: true } as const;
const str = { type: String, default: "" } as const;
const submissionId = { type: String, index: { unique: true, sparse: true } } as const;

export interface IAdminUser { email: string; passwordHash: string }
export const AdminUser = define<IAdminUser>("AdminUser", new Schema({ email: { ...req, unique: true, lowercase: true }, passwordHash: req }, opts));

export interface ISession { tokenHash: string; userId: mongoose.Types.ObjectId; expiresAt: Date }
export const Session = define<ISession>("Session", new Schema({
  tokenHash: { ...req, unique: true }, userId: { type: Schema.Types.ObjectId, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}, opts));

export interface IRateLimit { key: string; count: number; expiresAt: Date }
export const RateLimit = define<IRateLimit>("RateLimit", new Schema({
  key: { ...req, unique: true }, count: { type: Number, default: 0 }, expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}));

export interface ISiteSettings { key: string; data: Record<string, unknown>; seeded: boolean }
export const SiteSettings = define<ISiteSettings>("SiteSettings", new Schema({ key: { ...req, unique: true }, data: { type: Schema.Types.Mixed, default: {} }, seeded: { type: Boolean, default: false } }, opts));
export interface IPageContent { key: string; data: Record<string, unknown> }
export const PageContent = define<IPageContent>("PageContent", new Schema({ key: { ...req, unique: true }, data: { type: Schema.Types.Mixed, default: {} } }, opts));

export const Service = define<ServiceItem>("Service", new Schema({
  title: req, slug: { ...req, unique: true }, shortDescription: str, description: str, icon: str, image: str,
  benefits: [String], options: [String], order: { type: Number, default: 0 }, published: { type: Boolean, default: true },
}, opts).index({ published: 1, order: 1 }));

export const FAQ = define<FaqItem>("FAQ", new Schema({ question: req, answer: req, order: { type: Number, default: 0 }, published: { type: Boolean, default: true } }, opts).index({ published: 1, order: 1 }));

export const GalleryImage = define<GalleryItem>("GalleryImage", new Schema({
  title: req, description: str, category: { ...req, index: true }, kind: { type: String, enum: GALLERY_KINDS, default: "inspiration" },
  image: str, beforeImage: str, afterImage: str, video: str, order: { type: Number, default: 0 }, published: { type: Boolean, default: true },
}, opts).index({ published: 1, order: 1 }));

export interface IBooking {
  reference: string; submissionId?: string; requestType: string; fullName: string; email: string; phone: string; address: string; city: string; zip: string;
  service: string; preferredDate: string; preferredTime: string; budget: string; description: string; contactMethod: string; status: string; adminNotes: string;
}
export const Booking = define<IBooking>("Booking", new Schema({
  reference: { ...req, unique: true }, submissionId, requestType: req, fullName: req, email: req, phone: req, address: req, city: req, zip: req,
  service: req, preferredDate: req, preferredTime: req, budget: str, description: req, contactMethod: req,
  status: { type: String, enum: BOOKING_STATUSES, default: "Pending" }, adminNotes: str,
}, opts).index({ status: 1, createdAt: -1 }).index({ createdAt: -1 }).index({ preferredDate: 1 }));

export const Availability = define<AvailabilityShape & { key: string }>("Availability", new Schema({
  key: { ...req, unique: true }, weekdays: [Number], timeSlots: [String], blockedDates: [String], leadDays: Number, maxDaysAhead: Number, timeZone: String,
}, opts));

export interface IContactInquiry { submissionId?: string; fullName: string; email: string; phone: string; service: string; subject: string; message: string; status: string; read: boolean; adminNotes: string }
export const ContactInquiry = define<IContactInquiry>("ContactInquiry", new Schema({
  submissionId, fullName: req, email: req, phone: req, service: req, subject: req, message: req,
  status: { type: String, enum: INQUIRY_STATUSES, default: "New" }, read: { type: Boolean, default: false }, adminNotes: str,
}, opts).index({ status: 1, createdAt: -1 }).index({ createdAt: -1 }));

export interface ITestimonial { submissionId?: string; fullName: string; email: string; service: string; rating: number; message: string; originalMessage: string; image: string; consent: boolean; status: string; published: boolean }
export const Testimonial = define<ITestimonial>("Testimonial", new Schema({
  submissionId, fullName: req, email: req, service: req, rating: { type: Number, min: 1, max: 5, required: true }, message: req,
  originalMessage: { ...req, immutable: true }, image: str, consent: { type: Boolean, required: true, immutable: true },
  status: { type: String, enum: REVIEW_STATUSES, default: "Pending" }, published: { type: Boolean, default: false },
}, opts).index({ status: 1, published: 1, createdAt: -1 }));

export interface IPayment {
  reference: string; token: string; type: string; description: string; customerName: string; customerEmail: string; bookingReference: string;
  amountCents: number; refundedCents: number; currency: string; status: string; checkoutAttempt: number;
  stripeSessionId: string; stripePaymentIntentId: string; paidAt: Date | null; adminNotes: string;
}
export const Payment = define<IPayment>("Payment", new Schema({
  reference: { ...req, unique: true }, token: { ...req, unique: true }, type: { type: String, enum: PAYMENT_TYPES, required: true }, description: str,
  customerName: req, customerEmail: req, bookingReference: { ...str, index: true }, amountCents: { type: Number, required: true, min: 50 },
  refundedCents: { type: Number, default: 0 }, currency: { type: String, default: "usd" }, status: { type: String, enum: PAYMENT_STATUSES, default: "Unpaid" },
  checkoutAttempt: { type: Number, default: 0 }, stripeSessionId: { ...str, index: true }, stripePaymentIntentId: { ...str, index: true },
  paidAt: { type: Date, default: null }, adminNotes: str,
}, opts).index({ status: 1, createdAt: -1 }).index({ createdAt: -1 }));

export interface IWebhookEvent { eventId: string; type: string }
export const WebhookEvent = define<IWebhookEvent>("WebhookEvent", new Schema({ eventId: { ...req, unique: true }, type: req }, opts).index({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }));

export interface IStoredUpload { folder: string; filename: string; mimeType: string; size: number; data: Buffer }
export const StoredUpload = define<IStoredUpload>("StoredUpload", new Schema({ folder: req, filename: req, mimeType: req, size: { type: Number, required: true }, data: { type: Buffer, required: true } }, opts).index({ folder: 1, filename: 1 }, { unique: true }));
