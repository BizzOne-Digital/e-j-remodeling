import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { filterFrom, resourceFor } from "@/lib/admin-resources";
import { refreshSite } from "@/lib/content";
import { handler, HttpError, ok, parse } from "@/lib/http";

type Ctx = { params: Promise<{ resource: string }> };
export const GET = handler<Ctx>(async (req, ctx) => {
  await requireAdmin();
  const r = resourceFor((await ctx.params).resource);
  const q = new URL(req.url).searchParams;
  const page = Math.max(1, Math.min(10_000, Number(q.get("page")) || 1));
  const limit = r.ordered ? 200 : 15;
  const filter = filterFrom(r, q) as never;
  const [items, total] = await Promise.all([
    r.model.find(filter).select("-__v -submissionId").sort(r.sort).skip((page - 1) * limit).limit(limit).lean(),
    r.model.countDocuments(filter),
  ]);
  return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const POST = handler<Ctx>(async (req, ctx) => {
  await requireAdmin();
  const r = resourceFor((await ctx.params).resource);
  if (!r.create) throw new HttpError(405, "Not allowed.");
  const data = parse(z.record(z.string(), z.unknown()), parse(r.create, await req.json().catch(() => null)));
  if (r.ordered && data.order === undefined) {
    const last = await r.model.findOne().sort({ order: -1 }).select("order").lean<{ order?: number }>();
    data.order = (last?.order ?? -1) + 1;
  }
  const doc = await r.model.create((r.beforeCreate ? await r.beforeCreate(data) : data) as never);
  if (r.public) refreshSite();
  return ok({ item: doc }, 201);
});

/** Reorder: { ids: [...] } in the new order. */
export const PUT = handler<Ctx>(async (req, ctx) => {
  await requireAdmin();
  const r = resourceFor((await ctx.params).resource);
  if (!r.ordered) throw new HttpError(405, "Not allowed.");
  const { ids } = parse(z.object({ ids: z.array(z.string().regex(/^[a-f0-9]{24}$/)).max(200) }), await req.json().catch(() => null));
  await Promise.all(ids.map((id, order) => r.model.updateOne({ _id: id } as never, { $set: { order } } as never)));
  refreshSite();
  return ok();
});
