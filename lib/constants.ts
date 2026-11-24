export const SERVICE_OPTIONS = ["Electrical", "Plumbing", "Drywall", "Cabinets", "Showers", "Floors", "Multiple Services", "Other"] as const;
export const CONTACT_METHODS = ["Phone", "Email", "Text Message"] as const;
export const REQUEST_TYPES = ["Consultation", "Free Estimate"] as const;
export const BUDGETS = ["Not sure yet", "Under $5,000", "$5,000 – $15,000", "$15,000 – $30,000", "$30,000 – $50,000", "Over $50,000"] as const;
export const BOOKING_STATUSES = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"] as const;
export const INQUIRY_STATUSES = ["New", "In Progress", "Resolved", "Archived"] as const;
export const REVIEW_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export const PAYMENT_TYPES = ["Project Deposit", "Partial Payment", "Remaining Balance", "Custom Invoice Payment"] as const;
export const PAYMENT_STATUSES = ["Unpaid", "Pending", "Paid", "Failed", "Cancelled", "Refunded"] as const;
export const GALLERY_KINDS = ["inspiration", "project"] as const;
export const ICON_KEYS = ["electrical", "plumbing", "drywall", "cabinets", "showers", "floors", "wrench"] as const;
export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc", "services", "branding"] as const;
export const UPLOAD_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
/** Vercel rejects request bodies over 4.5 MB, so anything bigger is compressed in the browser first. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
