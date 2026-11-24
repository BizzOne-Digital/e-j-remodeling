import { clientIp, handler, ok, parseBody, rateLimit } from "@/lib/http";
import { startCheckout } from "@/lib/payments";
import { tokenSchema } from "@/validators/forms";
export const POST = handler(async (req) => {
  await rateLimit("checkout", clientIp(req), 20, 900);
  const { token } = await parseBody(req, tokenSchema);
  return ok({ url: await startCheckout(token) });
});
