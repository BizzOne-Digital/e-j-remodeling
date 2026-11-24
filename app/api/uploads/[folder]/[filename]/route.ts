import { UPLOAD_FOLDERS } from "@/lib/constants";
import { connectDB, isDbConfigured } from "@/lib/db";
import { FILENAME_RE } from "@/lib/image-signature";
import { StoredUpload } from "@/models";

export const runtime = "nodejs";
const missing = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
export async function GET(_req: Request, ctx: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await ctx.params;
  // The strict filename pattern leaves no room for separators, dots-dots or encodings.
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder) || !FILENAME_RE.test(filename) || !isDbConfigured()) return missing();
  try {
    await connectDB();
    const f = await StoredUpload.findOne({ folder, filename }).select("data mimeType").lean<{ mimeType: string; data: { buffer: Uint8Array } | Buffer }>();
    if (!f) return missing();
    const bytes = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data.buffer);
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": f.mimeType, "Content-Length": String(bytes.length), "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
