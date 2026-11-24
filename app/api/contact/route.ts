import { after } from "next/server";
import { clientIp, handler, looksLikeSpam, ok, parseBody, rateLimit } from "@/lib/http";
import { notifyAdmin } from "@/lib/mail";
import { ContactInquiry } from "@/models";
import { contactSchema } from "@/validators/forms";

export const POST = handler(async (req) => {
  await rateLimit("contact", clientIp(req), 6, 3600);
  const { website, startedAt, consent, ...d } = await parseBody(req, contactSchema);
  void consent;
  if (looksLikeSpam({ website, startedAt })) return ok({}, 201);
  try { await ContactInquiry.create(d); }
  catch (e) { if ((e as { code?: number }).code === 11000) return ok(); throw e; }
  after(() => notifyAdmin(`Website inquiry: ${d.subject}`, { Name: d.fullName, Email: d.email, Phone: d.phone, Service: d.service, Subject: d.subject, Message: d.message }, d.email));
  return ok({}, 201);
});
