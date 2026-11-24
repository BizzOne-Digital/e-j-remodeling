import { z } from "zod";
import { login } from "@/lib/auth";
import { clientIp, handler, ok, parseBody, rateLimit } from "@/lib/http";
export const POST = handler(async (req) => {
  const d = await parseBody(req, z.object({ email: z.string().trim().max(200).pipe(z.email("Enter a valid email")), password: z.string().min(1).max(200) }));
  await rateLimit("login-ip", clientIp(req), 10, 900);
  await rateLimit("login-email", d.email.toLowerCase(), 20, 3600);
  await login(d.email, d.password);
  return ok();
});
