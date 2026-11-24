import "server-only";
import { cache } from "react";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { connectDB, isDbConfigured } from "./db";
import { Availability, FAQ, GalleryImage, PageContent, Service, SiteSettings, Testimonial } from "@/models";
import { defaultAvailability, defaultFaqs, defaultGallery, defaultHome, defaultServices, defaultSettings, type Availability as AvailabilityShape } from "./defaults";
import { mergeDefaults } from "@/validators/shape";

const TAG = "site-content";
const HIDE = "-_id -__v -createdAt -updatedAt";

async function readSite() {
  await connectDB();
  const [settings, home, services, faqs, gallery] = await Promise.all([
    SiteSettings.findOne({ key: "site" }).lean(), PageContent.findOne({ key: "home" }).lean(),
    Service.find({ published: true }).select(HIDE).sort({ order: 1 }).lean(), FAQ.find({ published: true }).select(HIDE).sort({ order: 1 }).lean(),
    GalleryImage.find({ published: true }).select(HIDE).sort({ order: 1 }).limit(60).lean(),
  ]);
  const seeded = Boolean(settings?.seeded);
  return {
    settings: mergeDefaults(defaultSettings, settings?.data), home: mergeDefaults(defaultHome, home?.data),
    services: seeded ? (services as unknown as typeof defaultServices) : defaultServices,
    faqs: seeded ? (faqs as unknown as typeof defaultFaqs) : defaultFaqs,
    gallery: seeded ? (gallery as unknown as typeof defaultGallery) : defaultGallery,
  };
}
const fallback = () => ({ settings: defaultSettings, home: defaultHome, services: defaultServices, faqs: defaultFaqs, gallery: defaultGallery });

/** Without a database the site renders its defaults. A failing database at runtime throws, so ISR keeps the last good page. */
async function guarded<T>(read: () => Promise<T>, def: () => T): Promise<T> {
  if (!isDbConfigured()) return def();
  try { return await read(); } catch (e) {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") throw e;
    console.error("[content] database unavailable, using defaults:", (e as Error).name);
    return def();
  }
}
const cachedSite = unstable_cache(readSite, ["site-v1"], { tags: [TAG], revalidate: 600 });
export const getSite = cache(() => guarded(cachedSite, fallback));

const REVIEW_PAGE = 9;
export type PublicReview = { id: string; fullName: string; rating: number; message: string; service: string; image: string; date: string };
async function readReviews(page: number) {
  await connectDB();
  const filter = { status: "Approved", published: true, consent: true };
  const [rows, total] = await Promise.all([
    Testimonial.find(filter).select("fullName rating message service image createdAt").sort({ createdAt: -1 }).skip((page - 1) * REVIEW_PAGE).limit(REVIEW_PAGE).lean(),
    Testimonial.countDocuments(filter),
  ]);
  const items: PublicReview[] = rows.map((r) => ({ id: String(r._id), fullName: r.fullName, rating: r.rating, message: r.message, service: r.service, image: r.image || "", date: r.createdAt.toISOString() }));
  return { items, total, hasMore: page * REVIEW_PAGE < total };
}
const cachedReviews = unstable_cache(readReviews, ["reviews-v1"], { tags: [TAG], revalidate: 600 });
export const getReviews = (page = 1) => guarded(() => cachedReviews(page), () => ({ items: [] as PublicReview[], total: 0, hasMore: false }));

export async function getAvailability(): Promise<AvailabilityShape> {
  if (!isDbConfigured()) return defaultAvailability;
  await connectDB();
  return mergeDefaults(defaultAvailability, await Availability.findOne({ key: "default" }).lean());
}

export function refreshSite() {
  revalidateTag(TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/** One-time import of the default content so every item becomes editable. */
export async function ensureSeeded() {
  await connectDB();
  const site = await SiteSettings.findOneAndUpdate({ key: "site" }, { $setOnInsert: { key: "site" } }, { upsert: true, returnDocument: "after" });
  if (site?.seeded) return;
  await Promise.all([
    ...defaultServices.map((s) => Service.updateOne({ slug: s.slug }, { $setOnInsert: s }, { upsert: true })),
    ...defaultFaqs.map((f) => FAQ.updateOne({ question: f.question }, { $setOnInsert: f }, { upsert: true })),
    ...defaultGallery.map((i) => GalleryImage.updateOne({ image: i.image }, { $setOnInsert: i }, { upsert: true })),
  ]);
  await SiteSettings.updateOne({ key: "site" }, { $set: { seeded: true } });
  refreshSite();
}
