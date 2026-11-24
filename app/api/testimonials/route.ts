import { after } from "next/server";
import { getReviews } from "@/lib/content";
import { clientIp, handler, looksLikeSpam, ok, parseBody, rateLimit } from "@/lib/http";
import { notifyAdmin } from "@/lib/mail";
import { Testimonial } from "@/models";
import { reviewSchema } from "@/validators/forms";

export const GET = handler(async (req) => {
  const page = Math.max(1, Math.min(500, Math.floor(Number(new URL(req.url).searchParams.get("page")) || 1)));
  return ok(await getReviews(page));
});
export const POST = handler(async (req) => {
  await rateLimit("review", clientIp(req), 4, 3600);
  const { website, startedAt, ...d } = await parseBody(req, reviewSchema);
  if (looksLikeSpam({ website, startedAt })) return ok({}, 201);
  try { await Testimonial.create({ ...d, originalMessage: d.message }); }
  catch (e) { if ((e as { code?: number }).code === 11000) return ok(); throw e; }
  after(() => notifyAdmin("New review awaiting approval", { Name: d.fullName, Rating: String(d.rating), Service: d.service, Review: d.message }));
  return ok({}, 201);
});
