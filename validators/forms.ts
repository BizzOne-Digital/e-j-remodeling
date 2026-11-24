import { z } from "zod";
import { BUDGETS, CONTACT_METHODS, REQUEST_TYPES, SERVICE_OPTIONS } from "@/lib/constants";

// zod's JIT needs eval, which the site's Content-Security-Policy blocks.
z.config({ jitless: true });

const text = (label: string, max = 120, min = 2) =>
  z.string().trim().min(min, min > 2 ? `${label} needs at least ${min} characters` : `${label} is required`).max(max, `${label} is too long`);
const email = z.string().trim().toLowerCase().max(200).pipe(z.email("Enter a valid email address"));
const phone = z.string().trim().max(30).refine((v) => { const n = v.replace(/\D/g, "").length; return n >= 10 && n <= 15; }, "Enter a valid phone number");
const consent = z.boolean().refine((v) => v, "Please accept to continue");
/** Honeypot, form-fill timer and idempotency key shared by every public form. */
const antiSpam = {
  website: z.string().max(200).optional(),
  startedAt: z.number().int().optional(),
  submissionId: z.string().regex(/^[\w-]{16,64}$/).optional(),
};

export const bookingSchema = z.object({
  requestType: z.enum(REQUEST_TYPES),
  fullName: text("Full name"), email, phone,
  address: text("Property address", 200, 4), city: text("City", 100),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  service: z.enum(SERVICE_OPTIONS, "Choose a service"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  preferredTime: z.string().trim().min(1, "Choose a time").max(60),
  budget: z.union([z.literal(""), z.enum(BUDGETS)]).optional(),
  description: text("Project description", 3000, 10),
  contactMethod: z.enum(CONTACT_METHODS, "Choose a contact method"),
  consent, ...antiSpam,
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const contactSchema = z.object({
  fullName: text("Full name"), email, phone, service: z.enum(SERVICE_OPTIONS, "Choose a service"),
  subject: text("Subject", 150), message: text("Message", 3000, 10), consent, ...antiSpam,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const reviewSchema = z.object({
  fullName: text("Full name"), email, service: z.enum(SERVICE_OPTIONS, "Choose a service"),
  rating: z.number("Choose a rating").int().min(1, "Choose a rating").max(5),
  message: text("Review", 2000, 10), consent, ...antiSpam,
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const paymentLookupSchema = z.object({
  reference: z.string().trim().toUpperCase().regex(/^PAY-[A-Z0-9]{8}$/, "Enter the reference from your payment request"),
  email,
});
export const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) });
