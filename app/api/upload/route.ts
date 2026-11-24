import { randomBytes } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDERS, UPLOAD_MIMES } from "@/lib/constants";
import { handler, HttpError, ok, parse, rateLimit } from "@/lib/http";
import { EXT, sniffImage } from "@/lib/image-signature";
import { StoredUpload } from "@/models";

export const runtime = "nodejs";
export const POST = handler(async (req) => {
  const admin = await requireAdmin();
  await rateLimit("upload", admin.id, 120, 3600);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 20_000) throw new HttpError(413, "Image is too large. The maximum is 4 MB after compression.");
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = parse(z.enum(UPLOAD_FOLDERS, "Invalid folder"), form?.get("folder"));
  if (!(file instanceof File) || !file.size) throw new HttpError(400, "Choose an image to upload.");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Image is too large. The maximum is 4 MB after compression.");
  parse(z.enum(UPLOAD_MIMES, "Use a PNG, JPEG, WebP or GIF image"), file.type);
  const data = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffImage(data);
  if (!mimeType || mimeType !== file.type) throw new HttpError(400, "That file is not a valid image.");
  const filename = `${Date.now()}-${randomBytes(12).toString("hex")}.${EXT[mimeType]}`;
  await StoredUpload.create({ folder, filename, mimeType, size: data.length, data });
  return ok({ url: `/api/uploads/${folder}/${filename}`, filename, size: data.length, folder }, 201);
});
