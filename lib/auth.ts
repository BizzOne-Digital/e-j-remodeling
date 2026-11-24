import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB, isDbConfigured } from "./db";
import { HttpError } from "./http";
import { AdminUser, Session } from "@/models";

const secure = Boolean(process.env.VERCEL) || Boolean(process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https"));
const COOKIE = secure ? "__Host-ej_session" : "ej_session";
const cookieOpts = { httpOnly: true, secure, sameSite: "lax", path: "/" } as const;
const TTL_MS = 12 * 3600 * 1000;
export const isAuthConfigured = () => isDbConfigured() && (process.env.AUTH_SECRET?.length ?? 0) >= 32;

function hash(token: string) {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new HttpError(503, "Admin sign-in is not configured. Set AUTH_SECRET (32+ characters).");
  return createHmac("sha256", s).update(token).digest("hex");
}
const hashPassword = (p: string) => bcrypt.hash(p, 12);
let dummy: Promise<string> | null = null; // equalises timing for unknown emails

/** Creates the first admin from env vars, only while no admin exists. */
async function bootstrap() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(), pw = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !pw || pw.length < 12 || Buffer.byteLength(pw) > 72) return;
  if (await AdminUser.exists({})) return;
  await AdminUser.create({ email, passwordHash: await hashPassword(pw) }).catch(() => undefined);
}

export async function login(email: string, password: string) {
  hash("check");
  await bootstrap();
  const user = await AdminUser.findOne({ email: email.toLowerCase() }).lean();
  const valid = await bcrypt.compare(password, user?.passwordHash ?? (await (dummy ??= hashPassword("placeholder"))));
  if (!user || !valid) throw new HttpError(401, "Incorrect email or password.");
  const token = randomBytes(32).toString("hex");
  await Session.create({ tokenHash: hash(token), userId: user._id, expiresAt: new Date(Date.now() + TTL_MS) });
  (await cookies()).set(COOKIE, token, { ...cookieOpts, maxAge: TTL_MS / 1000 });
}

export async function currentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!isAuthConfigured() || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await connectDB();
  const s = await Session.findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } }).lean();
  if (!s) return null;
  const user = await AdminUser.findById(s.userId).select("email").lean();
  return user ? { id: String(user._id), email: user.email, sessionId: String(s._id), expiresAt: s.expiresAt } : null;
}
export async function requireAdmin() {
  const a = await currentAdmin();
  if (!a) throw new HttpError(401, "Your session has expired. Please sign in again.");
  return a;
}
export async function logout() {
  const jar = await cookies(), token = jar.get(COOKIE)?.value;
  if (token) await Session.deleteOne({ tokenHash: hash(token) });
  jar.set(COOKIE, "", { ...cookieOpts, maxAge: 0 });
}
export const listSessions = (id: string) => Session.find({ userId: id, expiresAt: { $gt: new Date() } }).select("createdAt expiresAt").sort({ createdAt: -1 }).lean();
export const endOtherSessions = (id: string, keep: string) => Session.deleteMany({ userId: id, _id: { $ne: keep } });
export async function changePassword(id: string, sessionId: string, current: string, next: string) {
  const user = await AdminUser.findById(id);
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) throw new HttpError(400, "Your current password is incorrect.");
  user.passwordHash = await hashPassword(next);
  await user.save();
  await endOtherSessions(id, sessionId);
}
