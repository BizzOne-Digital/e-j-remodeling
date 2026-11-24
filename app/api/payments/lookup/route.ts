import { clientIp, handler, HttpError, ok, parseBody, rateLimit } from "@/lib/http";
import { Payment } from "@/models";
import { paymentLookupSchema } from "@/validators/forms";
export const POST = handler(async (req) => {
  await rateLimit("pay-lookup", clientIp(req), 10, 900);
  const d = await parseBody(req, paymentLookupSchema);
  const p = await Payment.findOne({ reference: d.reference, customerEmail: d.email }).select("token").lean();
  if (!p) throw new HttpError(404, "We couldn't find a payment request with those details.");
  return ok({ token: p.token });
});
