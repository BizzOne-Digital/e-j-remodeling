import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { ensureSeeded, getAvailability, refreshSite } from "@/lib/content";
import { defaultHome, defaultSettings } from "@/lib/defaults";
import { handler, HttpError, ok, parse, parseBody } from "@/lib/http";
import { deleteUnusedUploads, uploadUrlsIn } from "@/lib/uploads";
import { Availability, PageContent, SiteSettings } from "@/models";
import { mergeDefaults, shapeOf } from "@/validators/shape";

type Ctx = { params: Promise<{ name: string }> };
const availability = z.object({
  weekdays: z.array(z.number().int().min(0).max(6)).min(1, "Choose at least one day").max(7),
  timeSlots: z.array(z.string().trim().min(1).max(60)).min(1, "Add at least one time").max(24),
  blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(400),
  leadDays: z.number().int().min(0).max(60), maxDaysAhead: z.number().int().min(1).max(365),
  timeZone: z.string().max(60).refine((v) => { try { new Intl.DateTimeFormat("en", { timeZone: v }); return true; } catch { return false; } }, "Unknown time zone"),
}).refine((v) => v.maxDaysAhead > v.leadDays, { message: "Must be greater than the notice period", path: ["maxDaysAhead"] });

async function read(name: string) {
  if (name === "settings") return mergeDefaults(defaultSettings, (await SiteSettings.findOne({ key: "site" }).lean())?.data);
  if (name === "home") return mergeDefaults(defaultHome, (await PageContent.findOne({ key: "home" }).lean())?.data);
  if (name === "availability") return getAvailability();
  throw new HttpError(404, "Not found.");
}
export const GET = handler<Ctx>(async (_req, ctx) => {
  await requireAdmin();
  await ensureSeeded();
  return ok({ data: await read((await ctx.params).name) });
});
export const PUT = handler<Ctx>(async (req, ctx) => {
  await requireAdmin();
  const { name } = await ctx.params;
  const before = await read(name);
  const body = await parseBody(req, z.unknown(), 400_000);
  if (name === "availability") await Availability.updateOne({ key: "default" }, { $set: parse(availability, body) }, { upsert: true });
  else if (name === "settings") await SiteSettings.updateOne({ key: "site" }, { $set: { data: parse(shapeOf(defaultSettings), body) as Record<string, unknown> } }, { upsert: true });
  else await PageContent.updateOne({ key: "home" }, { $set: { data: parse(shapeOf(defaultHome), body) as Record<string, unknown> } }, { upsert: true });
  await deleteUnusedUploads(uploadUrlsIn(before));
  refreshSite();
  return ok({ data: await read(name) });
});
