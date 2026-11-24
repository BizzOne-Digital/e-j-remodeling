import "server-only";
import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB, isDbConfigured } from "./db";
import { RateLimit } from "@/models";

export class HttpError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) { super(message); }
}
export const ok = (data: object = {}, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status, headers: { "Cache-Control": "no-store" } });
const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ success: false, error, fields }, { status, headers: { "Cache-Control": "no-store" } });

/** Uniform error handling: expected errors keep their message, anything else becomes a generic 500. */
export function handler<C = unknown>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) assertSameOrigin(req);
      if (!isDbConfigured()) throw new HttpError(503, "This feature is not available yet. Please call or email us instead.");
      await connectDB();
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return fail(e.status, e.message, e.fields);
      console.error("[api]", new URL(req.url).pathname, (e as Error).name, process.env.NODE_ENV === "production" ? "" : (e as Error).message);
      if ((e as { code?: number }).code === 11000) return fail(409, "That value is already in use.");
      return fail(500, "Something went wrong. Please try again.");
    }
  };
}

/** CSRF: browsers send Origin on every write; require it to match this host. */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let same = false;
  try { same = Boolean(origin) && new URL(origin!).host === host; } catch { /* malformed origin */ }
  if (!same) throw new HttpError(403, "Request blocked.");
}

export function parse<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[i.path.join(".")] ??= i.message;
  const [k, m] = Object.entries(fields)[0] ?? ["", "Invalid input"];
  throw new HttpError(400, k ? `${k}: ${m}` : m, fields);
}
export async function parseBody<T extends z.ZodType>(req: Request, schema: T, maxBytes = 64_000): Promise<z.infer<T>> {
  if (!req.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Expected JSON.");
  const raw = await req.text();
  if (Buffer.byteLength(raw) > maxBytes) throw new HttpError(413, "Request is too large.");
  let json: unknown;
  try { json = JSON.parse(raw); } catch { throw new HttpError(400, "Invalid request."); }
  return parse(schema, json);
}

const keyed = (v: string) => createHmac("sha256", process.env.AUTH_SECRET || "dev-only").update(v).digest("hex").slice(0, 32);
export const clientIp = (req: Request) =>
  req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

/** Fixed-window limiter in MongoDB, shared across serverless instances. Identifiers are stored hashed. */
export async function rateLimit(scope: string, id: string, limit: number, windowSec: number) {
  const win = Math.floor(Date.now() / 1000 / windowSec);
  const bump = () => RateLimit.findOneAndUpdate(
    { key: `${scope}:${keyed(id)}:${win}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((win + 1) * windowSec * 1000) } },
    { upsert: true, returnDocument: "after" }).lean();
  const doc = await bump().catch(bump);
  if ((doc?.count ?? 0) > limit) throw new HttpError(429, "Too many attempts. Please wait a little while and try again.");
}

/** True when a submission looks automated; callers answer with a neutral success so bots learn nothing. */
export const looksLikeSpam = (d: { website?: string; startedAt?: number }) => Boolean(d.website) || !d.startedAt || Date.now() - d.startedAt < 2500;
