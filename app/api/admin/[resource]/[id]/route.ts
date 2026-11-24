import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { resourceFor } from "@/lib/admin-resources";
import { refreshSite } from "@/lib/content";
import { handler, HttpError, ok, parse } from "@/lib/http";
import { deleteUnusedUploads, uploadUrlsIn } from "@/lib/uploads";

type Ctx = { params: Promise<{ resource: string; id: string }> };
async function load(ctx: Ctx) {
  await requireAdmin();
  const { resource, id } = await ctx.params;
  const r = resourceFor(resource);
  const cur = /^[a-f0-9]{24}$/.test(id) ? await r.model.findById(id).lean<Record<string, unknown>>() : null;
  if (!cur) throw new HttpError(404, "Not found.");
  return { r, id, cur };
}
export const PATCH = handler<Ctx>(async (req, ctx) => {
  const { r, id, cur } = await load(ctx);
  let data = parse(z.record(z.string(), z.unknown()), parse(r.update, await req.json().catch(() => null)));
  if (r.beforeUpdate) data = await r.beforeUpdate(cur, data);
  const item = await r.model.findByIdAndUpdate(id, { $set: data } as never, { returnDocument: "after", runValidators: true }).select("-__v -submissionId").lean();
  if (r.public) {
    await deleteUnusedUploads(uploadUrlsIn(cur));
    refreshSite();
  }
  return ok({ item });
});
export const DELETE = handler<Ctx>(async (_req, ctx) => {
  const { r, id, cur } = await load(ctx);
  if (!r.canDelete) throw new HttpError(405, "These records cannot be deleted.");
  await r.model.deleteOne({ _id: id } as never);
  if (r.public) {
    await deleteUnusedUploads(uploadUrlsIn(cur));
    refreshSite();
  }
  return ok();
});
