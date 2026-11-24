import { handler, HttpError, ok, parse } from "@/lib/http";
import { Payment } from "@/models";
import { tokenSchema } from "@/validators/forms";
export const GET = handler(async (req) => {
  const { token } = parse(tokenSchema, { token: new URL(req.url).searchParams.get("token") });
  const p = await Payment.findOne({ token }).select("status").lean();
  if (!p) throw new HttpError(404, "Payment request not found.");
  return ok({ status: p.status });
});
