import "server-only";
import { FILENAME_RE } from "./image-signature";
import { GalleryImage, PageContent, Service, SiteSettings, StoredUpload, Testimonial } from "@/models";

const ANY = /\/api\/uploads\/[a-z]+\/[\w.-]+/g;
export const uploadUrlsIn = (doc: unknown): string[] => JSON.stringify(doc ?? {}).match(ANY) ?? [];

/** Every upload URL currently referenced by any content document. */
async function referencedUploads() {
  return new Set(uploadUrlsIn(await Promise.all([
    SiteSettings.find().select("data").lean(), PageContent.find().select("data").lean(), Service.find().select("image").lean(),
    GalleryImage.find().select("image beforeImage afterImage").lean(), Testimonial.find({ image: { $ne: "" } }).select("image").lean(),
  ])));
}
/** Deletes uploads that are no longer used anywhere. Stock and external URLs are ignored. */
export async function deleteUnusedUploads(urls: string[]) {
  if (!urls.length) return;
  const used = await referencedUploads();
  for (const u of new Set(urls)) {
    const m = u.match(/^\/api\/uploads\/([a-z]+)\/([\w.-]+)$/);
    if (m && !used.has(u) && FILENAME_RE.test(m[2])) await StoredUpload.deleteOne({ folder: m[1], filename: m[2] });
  }
}
/** Removes unreferenced uploads older than a day (e.g. uploaded but never saved). */
export async function sweepOrphans() {
  const rows = await StoredUpload.find({ createdAt: { $lt: new Date(Date.now() - 86400_000) } }).select("folder filename").lean();
  const used = await referencedUploads();
  const ids = rows.filter((r) => !used.has(`/api/uploads/${r.folder}/${r.filename}`)).map((r) => r._id);
  if (ids.length) await StoredUpload.deleteMany({ _id: { $in: ids } });
  return ids.length;
}
