import { z } from "zod";
import { changePassword, endOtherSessions, listSessions, requireAdmin } from "@/lib/auth";
import { handler, ok, parseBody, rateLimit } from "@/lib/http";

const pw = z.string().min(12, "Use at least 12 characters").refine((v) => Buffer.byteLength(v) <= 72, "Password is too long");
export const GET = handler(async () => {
  const a = await requireAdmin();
  const sessions = await listSessions(a.id);
  return ok({ email: a.email, sessions: sessions.map((s) => ({ id: String(s._id), current: String(s._id) === a.sessionId, createdAt: s.createdAt, expiresAt: s.expiresAt })) });
});
export const PATCH = handler(async (req) => {
  const a = await requireAdmin();
  await rateLimit("password", a.id, 8, 900);
  const d = await parseBody(req, z.object({ current: z.string().min(1).max(200), next: pw }));
  await changePassword(a.id, a.sessionId, d.current, d.next);
  return ok();
});
export const DELETE = handler(async () => {
  const a = await requireAdmin();
  await endOtherSessions(a.id, a.sessionId);
  return ok();
});
